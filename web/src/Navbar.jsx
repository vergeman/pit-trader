import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="header">
      <Link to="/">Home</Link>
      <h1>Hello World</h1>
    </div>
  );
}
