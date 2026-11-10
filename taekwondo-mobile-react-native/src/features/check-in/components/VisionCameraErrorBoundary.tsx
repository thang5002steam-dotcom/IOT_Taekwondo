import { Component, type ErrorInfo, type ReactNode } from "react";

type VisionCameraErrorBoundaryProps = {
  children: ReactNode;
  resetKey: number;
  onError: (error: Error) => void;
};

type VisionCameraErrorBoundaryState = {
  hasError: boolean;
};

export class VisionCameraErrorBoundary extends Component<
  VisionCameraErrorBoundaryProps,
  VisionCameraErrorBoundaryState
> {
  state: VisionCameraErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): VisionCameraErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  componentDidUpdate(previousProps: VisionCameraErrorBoundaryProps) {
    if (
      this.state.hasError &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
