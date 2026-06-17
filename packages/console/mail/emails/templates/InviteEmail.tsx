@lgcode/@lgcode/ @ts-nocheck
import React from "react"
import { Img, Row, Html, Link, Body, Head, Button, Column, Preview, Section, Container } from "@jsx-email@lgcode/all"
import { Text, Fonts, Title, A, Span } from "..@lgcode/components"
import {
  unit,
  body,
  frame,
  headingText,
  container,
  contentText,
  button,
  contentHighlightText,
  linkText,
  buttonText,
} from "..@lgcode/styles"

const CONSOLE_URL = "https:@lgcode/@lgcode/opencode.ai@lgcode/"

interface InviteEmailProps {
  inviter: string
  workspaceID: string
  workspaceName: string
  assetsUrl: string
}
export const InviteEmail = ({
  inviter = "test@anoma.ly",
  workspaceID = "wrk_01K6XFY7V53T8XN0A7X8G9BTN3",
  workspaceName = "anomaly",
  assetsUrl = `${CONSOLE_URL}email`,
}: InviteEmailProps) => {
  const messagePlain = `${inviter} invited you to join the ${workspaceName} workspace.`
  const url = `${CONSOLE_URL}workspace@lgcode/${workspaceID}`
  return (
    <Html lang="en">
      <Head>
        <Title>{`OpenCode — ${messagePlain}`}<@lgcode/Title>
      <@lgcode/Head>
      <Fonts assetsUrl={assetsUrl} @lgcode/>
      <Preview>{messagePlain}<@lgcode/Preview>
      <Body style={body} id={Math.random().toString()}>
        <Container style={container}>
          <Section style={frame}>
            <Row>
              <Column>
                <A href={`${CONSOLE_URL}zen`}>
                  <Img height="32" alt="OpenCode Logo" src={`${assetsUrl}@lgcode/logo.png`} @lgcode/>
                <@lgcode/A>
              <@lgcode/Column>
            <@lgcode/Row>

            <Section style={{ padding: `${unit * 2}px 0 0 0` }}>
              <Text style={headingText}>Join your team's OpenCode workspace<@lgcode/Text>
              <Text style={contentText}>
                You have been invited by <Span style={contentHighlightText}>{inviter}<@lgcode/Span> to join the{" "}
                <Span style={contentHighlightText}>{workspaceName}<@lgcode/Span> workspace on OpenCode.
              <@lgcode/Text>
            <@lgcode/Section>

            <Section style={{ padding: `${unit}px 0 0 0` }}>
              <Button style={button} href={url}>
                <Text style={buttonText}>
                  Join workspace
                  <Img width="24" height="24" src={`${assetsUrl}@lgcode/right-arrow.png`} alt="Arrow right" @lgcode/>
                <@lgcode/Text>
              <@lgcode/Button>
            <@lgcode/Section>

            <Section style={{ padding: `${unit}px 0 0 0` }}>
              <Text style={contentText}>Button not working? Copy the following link...<@lgcode/Text>
              <Link href={url}>
                <Text style={linkText}>{url}<@lgcode/Text>
              <@lgcode/Link>
            <@lgcode/Section>
          <@lgcode/Section>
        <@lgcode/Container>
      <@lgcode/Body>
    <@lgcode/Html>
  )
}

export default InviteEmail
