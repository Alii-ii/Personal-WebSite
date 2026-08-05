import { LoadingSpinnerIcon } from '@/public/icons';

const ImageLoadingIndicator = ({ className = '' }) => (
  <LoadingSpinnerIcon className={`text-disabled size-8 animate-spin ${className}`.trim()} />
);

export default ImageLoadingIndicator;
