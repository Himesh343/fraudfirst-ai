import { Link } from "react-router-dom";

export function Button({ children, variant = "primary", size = "md", icon: Icon, to, className = "", ...props }) {
  const classes = `button button--${variant} button--${size} ${className}`.trim();
  const content = (
    <>
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
      <span>{children}</span>
    </>
  );
  if (to) {
    return <Link className={classes} to={to}>{content}</Link>;
  }
  return <button className={classes} {...props}>{content}</button>;
}
