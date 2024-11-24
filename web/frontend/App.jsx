import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { QueryProvider, PolarisProvider } from "./components";
import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [showPages, setShowPages] = useState(false);
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();

  const fetchExistence = async () => {
    try {
      const response = await fetch('/api/check-shop-existence', {
        method: 'GET', // Explicitly specifying the GET method
      });
      const data = await response.json();
      setShowPages(data?.status === 1 ? true: false)
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }


  useEffect(() => {
    fetchExistence()
  },[])

  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <NavMenu>
            <a href="/" rel="home" />
            <a href="/plansetting">{t("NavigationMenu.plansetting")}</a>
            {showPages && (
              <>
                <a href="/pagename">{t("NavigationMenu.pageName")}</a>
                <a href="/demo">{t("NavigationMenu.demo")}</a>
                <a href="/botConfig">{t("NavigationMenu.botConfig")}</a>
                <a href="/storeuserinfo">{t("NavigationMenu.storeuserinfo")}</a>
              </>
            )}
          </NavMenu>
          <Routes pages={pages} />
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
