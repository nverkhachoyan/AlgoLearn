export const layoutStyles = {
  mainLayout: {
    minHeight: "100vh",
  },
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
    background: "var(--bg-footer)",
    color: "var(--text-color)",
  },
  content: {
    margin: "0 16px",
  },
  breadcrumb: {
    margin: "16px 0",
  },
  contentContainer: {
    padding: 24,
    minHeight: 360,
    background: "var(--bg-content)",
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
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
