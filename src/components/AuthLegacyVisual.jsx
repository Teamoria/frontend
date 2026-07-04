const AUTH_LEGACY_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAihiwQ5gWaPNLFXzNG-TzS2eV0pPLpvfKcuLXvwklDhAET0Ao6oujo3rL7pREHOEaeUopVHbIOXzGKlzHBOtBvUjhf4SyYBHJUaMCn46KzUgUiP8NEjIFMOH4IvWOszKDZ_3eye1Av_F6UW0eoXThSb6pg6WvvrCC2wC_TpAScoDN3ifERvRQdeQwl142mfsWhiJKDGEIwQVwYdn0VktxZL2Ra-6sMzeWtD6-hAmcwzGk26As4cT7kFlmhYZTwI1obzGuHp1EU9fJh";

export default function AuthLegacyVisual({ className = "" }) {
  return (
    <div className={`auth-legacy-visual ${className}`.trim()} aria-hidden="true">
      <img src={AUTH_LEGACY_IMAGE} alt="" />
    </div>
  );
}
