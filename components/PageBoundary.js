"use client";

import { Component } from "react";
import ErrorCard from "./ErrorCard";

export default class PageBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: "" };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error);
    this.setState({ info: info?.componentStack || "" });
  }

  componentDidUpdate(prev) {
    // Opening another page clears the error
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null, info: "" });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorCard
          error={this.state.error}
          info={this.state.info}
          onRetry={() => this.setState({ error: null, info: "" })}
        />
      );
    }
    return this.props.children;
  }
}
