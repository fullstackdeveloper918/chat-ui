import React from "react";
import "./SubscriptionCard.css";
import toast from "react-hot-toast";
// import { useAuthenticatedFetch } from "../../hooks/index";


const SubscriptionCard = ({ plan }) => {
  // const fetch = useAuthenticatedFetch();

  const handleSubscribe = async () => {
   
    
    const shopDetails = {
      plane_status : plan?.text
    };




     const response = await fetch('api/store-userinfo', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shopDetails),
      });
  };
  return (
    <div className="card">
      <div className="header">
        <span className="license">{plan.text}</span>
        <h2>${plan.price}</h2>
        <span className="duration">/month</span>
      </div>
      <div className="featureContent">
        <div className="desc">
          <span>
            Ideal for small businesses starting out. <br />
            Up to 3000 visitors per month <br />
            Up to 500 products
          </span>
        </div>
        <ul className="features">
          <li>
            <a href="#">{plan.subscriber} Subscriber</a>
          </li>
          <li>
            <a href="#">{plan.member} Team Members</a>
          </li>
          <li>
            <a href="#">{plan.metric} Metrics</a>
          </li>
          <li>
            <a href="#">Email Notifications</a>
          </li>
          <li>
            <a href="#">Basic Customization</a>
          </li>
          <li>
            <a href="#">Status & Authenticated API</a>
          </li>
        </ul>
        <button className="btn" style={{cursor: 'pointer'}} onClick={handleSubscribe}>
          Start 30-day free trial
        </button>
      </div>
    </div>
  );
};
export default SubscriptionCard;