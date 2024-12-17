import React, { useEffect, useState } from "react";
import "./BotConfig.css";
import { toast } from "react-hot-toast";

const BotConfig = () => {
  const [envText, setEnvText] = useState("");
  const [apiHeader, setApiHeader] = useState("");
  const [formData, setFormData] = useState({
    productInfo: "",
    toneOfVoice: "Friendly",
    color: "#000000",
    logo: null,
    language: 'En',
    initialMessage: 'Welcome'
  });

  const fetchExistence = async () => {
    try {
      const response = await fetch("/api/apiendpoint-zoyia", {
        method: "GET",
      });

      const data = await response.json();

      
      setEnvText(data?.data?.apiUrl);
      setApiHeader(data?.data?.apiKey);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };


  useEffect(() => {
    fetchExistence();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (e.target.type === "file") {
      const file = e.target.files[0];
      if (file) {
        if (name === "logo") {
          const logoUrl = URL.createObjectURL(file);
          setFormData((prevData) => ({
            ...prevData,
            [name]: logoUrl,
          }));
        }
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleClose = () => {
    setFormData((prev) => ({
      ...prev,
      logo: null,
      chatVoice: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("productInfo", formData.productInfo);
      formDataToSend.append("toneOfVoice", formData.toneOfVoice);
      formDataToSend.append("language", formData.language);
      formDataToSend.append("color", formData.color);
      formDataToSend.append("color", formData.color);
      formDataToSend.append("logo", formData.logo);

      const response = await fetch(`${envText}shopify/admin_settings`, {
        method: "POST",
        headers: {
          Authorization: `${apiHeader}`, // Replace with your API key format
        },
        body: formDataToSend,
      });
      const data = await response.json();
//console.log(data, 'data')

      if (response) {
        // Optional: Parse JSON response if needed
        toast.success("Settings updated successfully");
        setFormData({
          productInfo: "",
          toneOfVoice: "Friendly",
          chatVoice: null,
          color: "#000000",
          logo: null,
        });
      }
    } catch (error) {
     // console.log(error, 'checkerror')
      if(error) {

        toast.error("Failed to update settings. Please try again.");
      }
    }
  };

  return (
    <div className="popup-filter">
      <h2>Product Form</h2>
      <form>
        {/* Product Info */}
        <div>
          <label htmlFor="productInfo">Product Info:</label>
          <input
            type="text"
            id="productInfo"
            name="productInfo"
            value={formData.productInfo}
            onChange={handleChange}
            required
          />
        </div>

        {/* Tone of Voice */}
        <div>
          <label htmlFor="toneOfVoice">Tone of Voice:</label>
          <select
            id="toneOfVoice"
            name="toneOfVoice"
            value={formData.toneOfVoice}
            onChange={handleChange}
            required
          >
            <option value="Friendly">Friendly</option>
            <option value="Professional">Professional</option>
          </select>
        </div>

        {/* Language */}

        <div>
          <label htmlFor="language">Language</label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            required
          >
            <option value="en">En</option>
            <option value="fr">FR</option>
          </select>
        </div>

        {/* Initial Message */}

        <div>
          <label htmlFor="intialMessage">Initial Message</label>
          <p>{formData.initialMessage}</p>
        </div>

        {/* Logo */}
        {formData.logo ? (
          <div>
            <img src={formData.logo} width={100} height={100} alt="" />
            <span onClick={handleClose}>x</span>
          </div>
        ) : (
          <div>
            <label htmlFor="logo">Add Logo</label>
            <input
              type="file"
              id="logo"
              name="logo"
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Color Picker */}
        <div>
          <label htmlFor="color">Select Color:</label>
          <input
            type="color"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            required
          />
        </div>

        {/* Submit Button */}
        <div>
          <button type="submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default BotConfig;
