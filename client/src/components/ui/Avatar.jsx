const Avatar = ({ user, size = 36 }) => {
  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt="profile"
        style={{ width: size, height: size }}
        className="rounded-full object-cover border border-slate-200 dark:border-slate-700"
      />
    );
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      style={{ width: size, height: size }}
      className="
        rounded-full
        bg-indigo-600
        flex items-center justify-center
        text-white font-semibold
      "
    >
      {initial}
    </div>
  );
};

export default Avatar;
