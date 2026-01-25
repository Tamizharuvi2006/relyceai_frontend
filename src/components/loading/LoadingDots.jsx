import React from 'react';
import LoadingAnimation from './LoadingAnimation';

const LoadingDots = ({ theme }) => {
  return (
    <LoadingAnimation type="dots" theme={theme} size="md" />
  );
};

export default LoadingDots;