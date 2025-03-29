import React, { ReactNode } from 'react';

type RenderFunction = () => ReactNode;

type ConditionalRendererProps = {
  condition: boolean;
  renderTrue: RenderFunction | ReactNode;
  renderFalse: RenderFunction | ReactNode;
};

const ConditionalRenderer = ({ condition, renderTrue, renderFalse }: ConditionalRendererProps) => {
  const renderContent = (content: RenderFunction | ReactNode) => {
    return typeof content === 'function' ? content() : content;
  };

  if (condition) {
    return <>{renderContent(renderTrue)}</>;
  }

  return <>{renderContent(renderFalse)}</>;
};
export type StateKey = string | number;

type StateRendererProps<T extends StateKey> = {
  state: T;
  renderers: Record<T, RenderFunction | ReactNode>;
  fallback?: RenderFunction | ReactNode;
};

export const StateRenderer = <T extends StateKey>({
  state,
  renderers,
  fallback,
}: StateRendererProps<T>) => {
  const renderContent = (content: RenderFunction | ReactNode) => {
    return typeof content === 'function' ? content() : content;
  };

  if (state in renderers) {
    return <>{renderContent(renderers[state])}</>;
  }

  return fallback ? <>{renderContent(fallback)}</> : null;
};

ConditionalRenderer.displayName = 'ConditionalRenderer';
StateRenderer.displayName = 'StateRenderer';

export default ConditionalRenderer;
