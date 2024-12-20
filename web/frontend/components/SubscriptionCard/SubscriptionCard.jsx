import React from "react";
import "./SubscriptionCard.css";
import toast from "react-hot-toast";

const SubscriptionCard = ({ plan, contractId, apiKey }) => {
  const handleSubscribe = async () => {
    const shopDetails = {
      plane_status: plan?.text,
    };

    console.log("status:", shopDetails.plane_status);

    // Send shop details to your backend API
    try {
      const shopResponse = await fetch("/api/store-userinfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shopDetails),
      });

      if (!shopResponse.ok) {
        throw new Error("Failed to store shop user info");
      }

      // GraphQL Mutation
      const graphqlQuery = `
        mutation subscriptionBillingAttemptCreate($contractId: ID!, $index: Int!) {
          subscriptionBillingAttemptCreate(
            subscriptionContractId: $contractId,
            subscriptionBillingAttemptInput: {
              billingCycleSelector: { index: $index },
              idempotencyKey: "aaa-bbb-ccc",
              originTime: "2020-10-01T10:00:00Z"
            }
          ) {
            subscriptionBillingAttempt {
              id
              ready
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const graphqlVariables = {
        contractId, 
        index: 0,   
      };

      const graphqlResponse = await fetch("/admin/api/2023-10/graphql.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": apiKey, // Shopify API Key
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: graphqlVariables,
        }),
      });

      const graphqlResult = await graphqlResponse.json();

      if (graphqlResult.errors || graphqlResult.data.subscriptionBillingAttemptCreate.userErrors.length > 0) {
        console.error(
          "GraphQL Errors:",
          graphqlResult.errors || graphqlResult.data.subscriptionBillingAttemptCreate.userErrors
        );
        toast.error("Failed to create subscription billing attempt. Please try again.");
      } else {
        console.log("Billing Attempt Created:", graphqlResult.data.subscriptionBillingAttemptCreate.subscriptionBillingAttempt);
        toast.success("Subscription billing attempt created successfully!");
      }
    } catch (error) {
      console.error("Error during subscription creation:", error);
      toast.error("An error occurred while creating the subscription.");
    }
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
        <button className="btn" style={{ cursor: "pointer" }} onClick={handleSubscribe}>
          Start 30-day free trial
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCard;
