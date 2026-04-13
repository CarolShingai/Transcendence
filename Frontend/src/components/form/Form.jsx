import React from 'react';

function Form({ id, onSubmit, children, className = 'form-grid' }) {
  const resolvedClassName = `${className} form-centered`;

  return (
    <form id={id} className={resolvedClassName} onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export default Form;
