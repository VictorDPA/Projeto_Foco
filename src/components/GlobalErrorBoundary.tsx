import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

type GlobalErrorBoundaryProps = {
  children: ReactNode;
};

type GlobalErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  state: GlobalErrorBoundaryState = { hasError: false };

  private handleWindowError = (event: ErrorEvent) => {
    console.error("Erro global não tratado:", event.error ?? event.message);
    this.setState({
      hasError: true,
      message: event.message || "Ocorreu um erro inesperado.",
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason =
      typeof event.reason === "string"
        ? event.reason
        : event.reason?.message || "Falha assíncrona não tratada.";

    console.error("Promise rejection não tratada:", event.reason);
    this.setState({ hasError: true, message: reason });
    event.preventDefault();
  };

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || "Ocorreu um erro inesperado.",
    };
  }

  componentDidMount(): void {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Erro capturado pelo Error Boundary:", error, errorInfo);
  }

  componentWillUnmount(): void {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <section className="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-center space-y-4 shadow-sm">
            <h1 className="text-2xl font-semibold">Ops, tivemos um erro inesperado</h1>
            <p className="text-sm text-muted-foreground">
              {this.state.message ||
                "A aplicação encontrou um problema e foi interrompida."}
            </p>
            <Button onClick={this.handleReload}>Recarregar aplicação</Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
