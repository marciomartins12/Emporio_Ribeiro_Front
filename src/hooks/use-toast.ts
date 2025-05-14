import { toast as hotToast } from 'react-hot-toast';

export const toast = ({ title, description, ...props }) => {
  return hotToast(description ? `${title}: ${description}` : title, props);
};
