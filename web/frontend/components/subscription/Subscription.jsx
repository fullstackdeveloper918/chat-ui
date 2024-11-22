import React, { useState } from "react";
import SubscriptionCard from "../SubscriptionCard/SubscriptionCard";
import './Subscription.css'
 const subscriptionPlans = [
    {
      id: 1,
      price: "9.99",
      subscriber: 5,
      member: 3,
      metric: 5,
      text: "Free"
    },
    {
      id: 2,
      price: "19.99",
      subscriber: 8,
      member: 5,
      metric: 5,
      text: "Advanced"

    },
    {
      id: 3,
      price: "29.99",
      subscriber: 9,
      member: 6,
      metric: 6,
      text: "Essential"

    },
    {
      id: 4,
      price: "49.99",
      subscriber: 11,
      member: 8,
      metric: 9,
      text: "Essential"

    },
  ];
const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  return (
    <div className="subscription-page">
      <h1>Choose Your Subscription Plan</h1>
      <div className="subscription-cards">
        {subscriptionPlans.map((plan) => (
          <SubscriptionCard key={plan.id} plan={plan}  />
        ))}
      </div>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};
export default Subscription;