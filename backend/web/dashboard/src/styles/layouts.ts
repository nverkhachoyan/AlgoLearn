export const layoutStyles = {
  mainLayout: {
    minHeight: "100vh",
  },
  logo: {
    height: 32,
    margin: 16,
    // background: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: "0 16px",
    background: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e0e0e0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  headerLeft: {
    marginRight: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center" as const,
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
    background: "white",
    borderRadius: 8,
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
