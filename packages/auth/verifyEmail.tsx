import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface VerifyEmailProps {
  url: string;
  isDarkmode: boolean;
}

export const VerifyEmail: React.FC<Readonly<VerifyEmailProps>> = ({
  url,
  isDarkmode,
}) => {
  const darkColor = "rgb(71 85 105)";
  const lightColor = "rgb(229 229 229)";

  const main = {
    backgroundColor: isDarkmode ? darkColor : lightColor,
    margin: "0 auto",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  };

  const container = {
    margin: "auto",
    padding: "96px 20px 64px",
  };

  const h1 = {
    color: isDarkmode ? lightColor : darkColor,
    fontSize: "24px",
    fontWeight: "600",
    lineHeight: "40px",
    margin: "0 0 20px",
  };

  const text = {
    color: isDarkmode ? "#aaaaaa" : darkColor,
    fontSize: "14px",
    lineHeight: "24px",
    margin: "0 0 40px",
  };

  const copyright = {
    color: isDarkmode ? "#aaaaaa" : darkColor,
    fontSize: "12px",
    lineHeight: "24px",
    margin: "0 0 40px",
  };

  const button = {
    backgroundColor: isDarkmode ? lightColor : darkColor,
    borderRadius: "4px",
    color: isDarkmode ? darkColor : lightColor,
    textDecoration: "none",
    padding: "16px 24px",
    margin: "0 0 40px",
    display: "inline-block",
  };
  return (
    <Html>
      <Head />
      <Preview>
        Use this email to verify your account. Thank you for your patience.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You'll be onboard in no time.</Heading>
          <Text style={text}>
            Hey there, nice to see ya! If you own a studenture account, please
            verify it's you by clicking the button below.
          </Text>
          <Button href={url} style={button}>
            Click me
          </Button>
          <Text style={text}>
            If you don't know what's going on, you can safely ignore this email.
          </Text>
        </Container>

        <Text style={copyright}>© 2021 Studenture. All rights reserved.</Text>
      </Body>
    </Html>
  );
};

export default VerifyEmail;
