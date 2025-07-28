export default function UserCard({ user, onClick }) {
  const avatarUrl = user.avatar || "https://via.placeholder.com/40?text=👤"

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px",
        marginBottom: "6px",
      }}
    >
      <img
        src={avatarUrl}
        alt="avatar"
        width="40"
        height="40"
        style={{ borderRadius: "50%" }}
      />
      <span style={{ textTransform: "lowercase" }}>{user.nome}</span>
    </div>
  )
}