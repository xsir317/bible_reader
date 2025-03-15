import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const About = () => {
  const navigate = useNavigate();
  
  return (
    <div className="page-container">
      <div className="page-header">
        <FaArrowLeft onClick={() => navigate(-1)} />
        <h2>关于我们</h2>
      </div>
    </div>
  );
};

export default About;