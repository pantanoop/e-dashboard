import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/auth";
import { useLoading } from "../contexts/loadingContext"; // ✅ use correct hook

function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState(false);
  const { user } = useContext(AuthContext);
  const { showLoading, hideLoading } = useLoading(); // ✅ loading context
  const navigate = useNavigate();

  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      alert("Unauthorized access. Only admins or managers can add products.");
      navigate("/products");
    }
  }, [user, navigate]);

  async function handleAddProduct() {
    if (!name || !price || !category || !company) {
      setError(true);
      return;
    }

    showLoading(); // ✅ Start spinner

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/addProduct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, price, category, company }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("✅ Product added successfully!");
        setName("");
        setPrice("");
        setCategory("");
        setCompany("");
        setError(false);
        navigate("/products");
      } else {
        throw new Error(result.error || "Product could not be added");
      }
    } catch (err) {
      console.error("❌ Add product failed:", err);
      alert("Something went wrong while adding the product.");
    } finally {
      hideLoading(); // ✅ Stop spinner
    }
  }

  return (
    <div className="add-product-form">
      <h2>Add a New Product</h2>
      <input
        type="text"
        placeholder="Enter product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && !name && <span className="error">Enter valid name</span>}

      <input
        type="text"
        placeholder="Enter price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      {error && !price && <span className="error">Enter valid price</span>}

      <input
        type="text"
        placeholder="Enter category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      {error && !category && (
        <span className="error">Enter valid category</span>
      )}

      <input
        type="text"
        placeholder="Enter company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      {error && !company && <span className="error">Enter valid company</span>}

      <button onClick={handleAddProduct}>Add Product</button>
    </div>
  );
}

export default AddProduct;
