import React from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'

function HomeContent() {
  return (
    <div className="hero-content">
      <div className="bubble">
        <img src="img/logo.png" />
        <h1>
          <span className="fn">mlok</span>
          <span className="br">&lt;</span>
          <span className="type">T</span>
          <span className="br">&gt;</span>
          <span className="br">()</span>
        </h1>
        <h2>create mocks like this 🫰</h2>
        <Link className="button button--primary" to="/docs/intro">
          Learn more
        </Link>
        <br />
      </div>
    </div>
  )
}
export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomeContent />
    </Layout>
  )
}
