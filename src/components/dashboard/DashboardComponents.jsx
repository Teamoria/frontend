import {
  FiArrowRight,
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiPieChart,
  FiTrendingUp,
  FiUploadCloud,
  FiUser,
  FiZap
} from "react-icons/fi";
import { aiInsightLevels } from "../../data/dashboardInsights.js";

export function DashboardMetricCard({ classNamePrefix, icon: Icon, label, value, detail, tone = "primary", progress }) {
  const baseClass = `${classNamePrefix}-metric-card`;
  const glassClass = classNamePrefix === "exec" ? "exec-glass-card" : "";

  return (
    <article className={`${glassClass} ${baseClass} tone-${tone}`}>
      <div className={`${classNamePrefix}-metric-head`}>
        <span>{Icon ? <Icon aria-hidden="true" /> : null}</span>
        {detail ? <em>{detail}</em> : null}
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
      {typeof progress === "number" ? (
        <div className={`${classNamePrefix}-progress`}><i style={{ width: `${progress}%` }} /></div>
      ) : null}
    </article>
  );
}

export function AIInsightCard({ insight, classNamePrefix = "dashboard" }) {
  if (!insight) return null;

  const levelLabel = aiInsightLevels[insight.level] || insight.level;

  return (
    <article className={`${classNamePrefix}-ai-insight-card insight-${insight.level}`}>
      <div className={`${classNamePrefix}-ai-insight-head`}>
        <span><FiZap aria-hidden="true" /></span>
        <div>
          <small>{levelLabel} - {insight.scope}</small>
          <h4>{insight.title}</h4>
        </div>
        <em>{insight.confidence}%</em>
      </div>
      <p>{insight.summary}</p>
      <div className={`${classNamePrefix}-ai-sources`}>
        {insight.sources.map((source) => (
          <a href={source.href} key={`${insight.id}-${source.label}`}>{source.label}</a>
        ))}
      </div>
      <div className={`${classNamePrefix}-ai-actions`}>
        {insight.actions.map((action) => (
          <a href={action.href} key={`${insight.id}-${action.label}`}>
            {action.label}
            <FiArrowRight aria-hidden="true" />
          </a>
        ))}
      </div>
    </article>
  );
}

export function TaskDistributionChart({ data, classNamePrefix = "dashboard" }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const gradient = data.map((item) => {
    const start = cursor;
    const end = cursor + (item.value / total) * 100;
    cursor = end;
    return `var(--chart-${item.tone}) ${start}% ${end}%`;
  }).join(", ");

  return (
    <article className={`${classNamePrefix}-chart-card`}>
      <ChartTitle icon={<FiPieChart />} title="Task Distribution" />
      <div className="dashboard-donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
        <strong>{total}</strong>
        <span>Tasks</span>
      </div>
      <ChartLegend data={data} />
    </article>
  );
}

export function ProjectProgressChart({ data, classNamePrefix = "dashboard" }) {
  return (
    <article className={`${classNamePrefix}-chart-card`}>
      <ChartTitle icon={<FiTrendingUp />} title="Project Progress" />
      <div className="dashboard-progress-chart">
        {data.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <div><i style={{ width: `${item.value}%` }} /></div>
            <b>{item.value}%</b>
          </div>
        ))}
      </div>
    </article>
  );
}

export function ActivityOverviewChart({ data, classNamePrefix = "dashboard" }) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <article className={`${classNamePrefix}-chart-card`}>
      <ChartTitle icon={<FiBarChart2 />} title="Activity Overview" />
      <div className="dashboard-bar-chart">
        {data.map((item) => (
          <div key={item.label}>
            <i style={{ height: `${(item.value / maxValue) * 100}%` }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export function WorkspaceActivityFeed({ activities, classNamePrefix = "dashboard" }) {
  return (
    <article className={`${classNamePrefix}-workspace-activity-card`}>
      <div className="workspace-activity-head">
        <div>
          <h3>Recent Workspace Activity</h3>
          <p>New tasks, meetings, uploads, and user actions across the workspace.</p>
        </div>
        <a href="#/workspace">View all</a>
      </div>
      <div className="workspace-activity-list">
        {activities.map((activity) => {
          const Icon = activityIconMap[activity.type] || FiCheckCircle;
          return (
            <a className={`workspace-activity-item activity-${activity.type}`} href={activity.href} key={activity.id}>
              <span className="workspace-activity-icon"><Icon aria-hidden="true" /></span>
              <div>
                <div className="workspace-activity-title-row">
                  <b>{activity.title}</b>
                  <em>{activity.type}</em>
                </div>
                <p>{activity.detail}</p>
                <small>{activity.actor} - {activity.workspace}</small>
              </div>
              <time>{activity.time}</time>
            </a>
          );
        })}
      </div>
    </article>
  );
}

function ChartTitle({ icon, title }) {
  return (
    <div className="dashboard-chart-title">
      {icon}
      <h3>{title}</h3>
    </div>
  );
}

function ChartLegend({ data }) {
  return (
    <div className="dashboard-chart-legend-list">
      {data.map((item) => (
        <span className={`tone-${item.tone}`} key={item.label}>
          <i />
          {item.label}
          <b>{item.value}</b>
        </span>
      ))}
    </div>
  );
}

const activityIconMap = {
  task: FiCheckCircle,
  meeting: FiCalendar,
  upload: FiUploadCloud,
  user: FiUser
};
