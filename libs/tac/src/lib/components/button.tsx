import { ButtonHTMLAttributes } from 'react';

export const PrimaryButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={`px-2 py-1 bg-lime-600 hover:bg-lime-800 disabled:bg-lime-900 rounded ${props.className}`}
      {...props}
    >
      {props.children}
    </button>
  );
};

export const SecondaryButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
	return (
	  <button
		className={`px-2 py-1 bg-rose-600 hover:bg-rose-800 disabled:bg-rose-900 rounded ${props.className}`}
		{...props}
	  >
		{props.children}
	  </button>
	);
  };
  