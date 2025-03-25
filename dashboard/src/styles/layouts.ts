export const layoutStyles = {
  logo: {
    height: 32,
    margin: 16,
    borderRadius: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: "0 16px",
    background: "var(--bg-header)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--border-color)",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  headerLeft: {
    marginRight: 16,
    fontSize: 16,
    fontWeight: "bold",
    color: "var(--text-color)",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: "2rem",
  },
  content: {
    margin: "0 16px",
  },
  breadcrumb: {
    margin: "16px 0",
  },
  logoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    margin: 0,
    padding: 0,
    cursor: "pointer",
  },
};
