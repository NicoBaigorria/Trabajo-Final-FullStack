import { useState } from "react";
import { useAuth } from "../components/AuthProvider";

const LoginPage = () => {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const auth = useAuth();
  const handleSubmitEvent = (e) => {
    e.preventDefault();
    if (input.username !== "" && input.password !== "") {
      auth.loginAction(input);
      return;
    }
    alert("please provide a valid input");
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Iniciar Sesión</h2>
      <form onSubmit={handleSubmitEvent} className="container mt-4">
        <div className="mb-3">
          <label htmlFor="user-email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            className="form-control"
            id="user-email"
            name="username"
            placeholder="example@yahoo.com"
            aria-describedby="user-email"
            aria-invalid="false"
            onChange={handleInput}
          />
          <div id="user-email" className="form-text">
            Please enter a valid username. It must contain at least 6
            characters.
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password:
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            aria-describedby="user-password"
            aria-invalid="false"
            onChange={handleInput}
          />
          <div id="user-password" className="form-text">
            Your password should be more than 6 characters.
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
