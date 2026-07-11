import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import {
  disconnectEcho,
  getEcho,
  getRealtimeState,
  subscribeToPrivateChannel,
  subscribeToRealtimeState
} from "./reverb.js";
import { getAccessToken, subscribeToSessionChanges } from "../api/session.js";

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const [realtimeState, setRealtimeState] = useState(getRealtimeState);
  const [hasToken, setHasToken] = useState(() => Boolean(getAccessToken()));
  const [sessionVersion, setSessionVersion] = useState(0);
  const userId = user?.id || user?.user_id || "";

  useEffect(() => subscribeToRealtimeState(setRealtimeState), []);

  useEffect(() => subscribeToSessionChanges(() => {
    disconnectEcho();
    setHasToken(Boolean(getAccessToken()));
    setSessionVersion((current) => current + 1);
  }), []);

  useEffect(() => {
    if (!userId || !hasToken) {
      disconnectEcho();
    }
  }, [hasToken, userId]);

  useEffect(() => () => disconnectEcho(), []);

  const connect = useCallback(() => getEcho(), []);
  const disconnect = useCallback(() => disconnectEcho(), []);
  const subscribePrivate = useCallback((options) => subscribeToPrivateChannel(options), []);

  const value = useMemo(() => ({
    configured: realtimeState.configured,
    connectionStatus: realtimeState.status,
    connectionError: realtimeState.error,
    connectionErrorScope: realtimeState.errorScope,
    isConnected: realtimeState.status === "connected",
    hasToken,
    sessionVersion,
    connect,
    disconnect,
    subscribePrivate
  }), [connect, disconnect, hasToken, realtimeState, sessionVersion, subscribePrivate]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}

export function useRealtimePrivateChannel({
  channelName,
  eventName,
  enabled = true,
  onEvent,
  onSubscribed,
  onError
}) {
  const realtime = useRealtime();
  const onEventRef = useRef(onEvent);
  const onSubscribedRef = useRef(onSubscribed);
  const onErrorRef = useRef(onError);
  const [subscription, setSubscription] = useState({ status: "idle", error: null });

  onEventRef.current = onEvent;
  onSubscribedRef.current = onSubscribed;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!enabled || !channelName || !eventName || !realtime.configured || !realtime.hasToken) {
      setSubscription({ status: realtime.configured ? "idle" : "disabled", error: null });
      return undefined;
    }

    let isActive = true;
    setSubscription({ status: "subscribing", error: null });

    const unsubscribe = realtime.subscribePrivate({
      channelName,
      eventName,
      onEvent: (event) => onEventRef.current?.(event),
      onSubscribed: () => {
        if (!isActive) return;
        setSubscription({ status: "subscribed", error: null });
        onSubscribedRef.current?.();
      },
      onError: (error) => {
        if (!isActive) return;
        setSubscription({ status: "failed", error });
        onErrorRef.current?.(error);
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [
    channelName,
    enabled,
    eventName,
    realtime.configured,
    realtime.hasToken,
    realtime.sessionVersion,
    realtime.subscribePrivate
  ]);

  return {
    configured: realtime.configured,
    connectionStatus: realtime.connectionStatus,
    connectionError: realtime.connectionError,
    subscriptionStatus: subscription.status,
    subscriptionError: subscription.error,
    isReady: realtime.connectionStatus === "connected" && subscription.status === "subscribed"
  };
}
