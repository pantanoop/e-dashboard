import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../contexts/auth";
import { useLoading } from "../contexts/loadingContext"; // ✅ import global loading

function UpdateProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const { user } = useContext(AuthContext);
  const { showLoading, hideLoading } = useLoading(); // ✅
  const tenantId = user?.tenantId;

  useEffect(() => {
    getProductDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getProductDetail() {
    showLoading(); // ✅
    try {
      const token = JSON.parse(localStorage.getItem("token"));

      const res = await fetch(`http://localhost:5000/product/${params.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok) {
        setName(result.name);
        setPrice(result.price);
        setCategory(result.category);
        setCompany(result.company);
      } else {
        alert("⚠️ Failed to fetch product details");
        navigate("/products");
      }
    } catch (err) {
      console.error("❌ Error loading product:", err);
      alert("Something went wrong. Try again.");
    } finally {
      hideLoading(); // ✅
    }
  }

  async function handleUpdateProduct() {
    if (!name || !price || !category || !company) {
      setError(true);
      return;
    }

    showLoading(); // ✅
    try {
      const token = JSON.parse(localStorage.getItem("token"));

      const res = await fetch(`http://localhost:5000/product/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          price,
          category,
          company,
          tenantId,
        }),
      });

      const result = await res.json();

      if (res.ok && result) {
        alert("✅ Product updated successfully");
        navigate("/products");
      } else {
        alert("❌ Failed to update product");
      }
    } catch (err) {
      console.error("❌ Update error:", err);
      alert("Something went wrong.");
    } finally {
      hideLoading(); // ✅
    }
  }

  return (
    <div className="add-product-form">
      <h2>Update Product</h2>

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

      <button onClick={handleUpdateProduct}>Update Product</button>
    </div>
  );
}

export default UpdateProduct;
