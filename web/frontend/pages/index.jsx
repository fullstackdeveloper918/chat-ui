import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";
import { useEffect } from "react";

export default function HomePage() {
  const { t } = useTranslation();
  
  useEffect(() => {
    // Define the API URL
    const apiUrl = '/api/testing';

    // Fetch the data when the component mounts
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data)
        setData(data);
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch(error => {
        setError(error);
        setLoading(false); // Set loading to false if there's an error
      });
  }, []);


  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Text as="h2" variant="headingMd">
                    {t("HomePage.heading")}
                  </Text>
                  <p>
                    <Trans
                      i18nKey="HomePage.yourAppIsReadyToExplore"
                      components={{
                        PolarisLink: (
                          <Link url="https://polaris.shopify.com/" external />
                        ),
                        AdminApiLink: (
                          <Link
                            url="https://shopify.dev/api/admin-graphql"
                            external
                          />
                        ),
                        AppBridgeLink: (
                          <Link
                            url="https://shopify.dev/apps/tools/app-bridge"
                            external
                          />
                        ),
                      }}
                    />
                  </p>

                
                 
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  
                <svg width="101" height="25" viewBox="0 0 101 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 24.3565L4.31161 24.3386L19.3295 24.2238L19.3708 19.9289H5.64005C11.7798 15.6792 10.9979 12.3677 14.6673 8.52728C15.7501 7.39239 17.2201 6.21515 19.3718 4.95138L19.3305 0.625449L0 0.648971V5.0803L11.8248 5.01067C11.507 5.3165 11.1741 5.64963 10.8357 6.01101C10.832 6.01471 10.832 6.01759 10.8292 6.01759C6.81288 10.288 1.35938 18.3291 0 20.1792" fill="#B21CFF" />
            <path d="M54.4496 0.609392V24.3714H49.088V0.609392H54.4496Z" fill="#B21CFF" />
            <path d="M63.2782 0.609392L68.7438 11.7221L74.2096 0.609392H80.2668L68.5695 24.3714H62.5122L65.7148 17.8718L57.22 0.609392H63.2782Z" fill="#B21CFF" />
            <path d="M89.5109 0.609524L101 24.3716H95.0813C94.594 23.4277 93.4803 22.0999 91.7392 22.0999C89.0227 22.0999 86.1334 24.9306 81.8165 24.9306C77.4992 24.9306 74.6801 20.5275 78.9617 12.2454L84.9842 0.608587H89.5092L89.5109 0.609524ZM91.7047 17.3477L87.248 8.19242L84.6031 13.434C83.2449 16.1244 81.2952 20.1783 83.8022 20.1783C85.8214 20.1783 88.8153 17.6968 91.7047 17.3477Z" fill="#B21CFF" />
            <path d="M33.0941 20.5123C33.1776 20.5227 33.2563 20.5331 33.3397 20.5396C33.4363 20.55 33.5338 20.5566 33.6266 20.5641C33.4541 20.5576 33.2769 20.5396 33.0941 20.5123ZM32.8935 20.4879C32.9629 20.4983 33.0285 20.5086 33.0941 20.5123C32.6863 20.4531 32.2916 20.3599 31.9044 20.231C32.2438 20.3487 32.5756 20.4361 32.8935 20.4879ZM33.0941 20.5123C33.1776 20.5227 33.2563 20.5331 33.3397 20.5396C33.4363 20.55 33.5338 20.5566 33.6266 20.5641C33.4541 20.5576 33.2769 20.5396 33.0941 20.5123ZM32.8935 20.4879C32.9629 20.4983 33.0285 20.5086 33.0941 20.5123C32.6863 20.4531 32.2916 20.3599 31.9044 20.231C32.2438 20.3487 32.5756 20.4361 32.8935 20.4879ZM33.0941 20.5123C33.1776 20.5227 33.2563 20.5331 33.3397 20.5396C33.4363 20.55 33.5338 20.5566 33.6266 20.5641C33.4541 20.5576 33.2769 20.5396 33.0941 20.5123ZM32.8935 20.4879C32.9629 20.4983 33.0285 20.5086 33.0941 20.5123C32.6863 20.4531 32.2916 20.3599 31.9044 20.231C32.2438 20.3487 32.5756 20.4361 32.8935 20.4879Z" fill="#B21CFF" />
            <path d="M30.1597 0.357354C22.955 1.96652 18.8561 8.25359 20.4143 15.2784C21.9715 22.3032 28.34 26.2518 35.5448 24.6427C42.7496 23.0335 46.8483 16.7464 45.2902 9.72162C43.733 2.69677 37.3645 -1.25182 30.1597 0.357354ZM36.6267 19.1865C36.2095 19.7991 35.3788 20.2405 34.34 20.4296C34.1695 20.4607 33.9941 20.4823 33.8085 20.4946C33.7438 20.5058 33.6772 20.5096 33.6079 20.5143C33.2863 20.5331 32.9432 20.5209 32.5869 20.4795C32.5119 20.4748 32.435 20.4673 32.3573 20.4522C32.2738 20.4428 32.1894 20.4296 32.105 20.4165C30.3425 20.1238 28.3963 19.2251 27.126 18.0498C26.8944 17.8352 26.6928 17.6169 26.5212 17.3985C26.749 17.3722 26.976 17.3393 27.2009 17.2997C28.3053 17.1172 29.3403 16.8001 30.3566 16.4914L30.4532 16.4632C31.8313 16.0454 32.9685 15.7273 34.0672 15.7094C35.2232 15.6962 36.3651 16.3089 36.8433 17.2019C37.1779 17.8314 37.1086 18.4798 36.6276 19.1847L36.6267 19.1865ZM40.0327 14.4917C38.6985 12.6454 36.4242 11.5133 34.011 11.5472C32.241 11.5688 30.5835 12.0713 29.2531 12.4788L29.1538 12.508C27.9125 12.8853 26.7406 13.243 25.6175 13.2909C25.6072 13.1969 25.6015 13.1037 25.5875 13.0096C25.0662 9.72064 27.0678 5.17733 31.3213 4.50826C35.5185 3.84859 38.9798 6.36865 39.9857 10.9063C40.2567 12.1259 40.2585 13.3493 40.0327 14.4917Z" fill="#B21CFF" />
          </svg>
                  {/* <Image
                    source={trophyImage}
                    alt={t("HomePage.trophyAltText")}
                    width={120}
                  /> */}
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
