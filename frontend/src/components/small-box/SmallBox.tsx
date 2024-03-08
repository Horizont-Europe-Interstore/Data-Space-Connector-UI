import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export interface SmallBoxProps {
  type: 'info' | 'success' | 'warning' | 'danger';
  icon?: string;
  count: string;
  title: string;
  textNavigateTo: string;
  navigateTo: string;
}

const SmallBox = ({
  type = 'info',
  icon = 'ion-bag',
  count,
  title,
  textNavigateTo,
  navigateTo
}: SmallBoxProps) => {
  const [t] = useTranslation();

  return (
    <div className={`small-box bg-${type}`}>
      <div className="inner">
        <p>{title}</p>
        <h4 style={{ textAlign: "center" }}>{count}</h4>

      </div>
      <div className="icon">
        <i className={`ion ${icon}`} />
      </div>
      <Link to={navigateTo} className="small-box-footer">
        <span className="mr-2">{textNavigateTo}</span>
        <i className="fa fa-arrow-circle-right" />
        
      </Link>
    </div>
  );
};

export default SmallBox;
