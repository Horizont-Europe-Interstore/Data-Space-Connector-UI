import React from 'react';
import {useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {MenuItem} from '@components';
import {PfImage} from '@profabric/react-components';
import styled from 'styled-components';
import {SidebarSearch} from '@app/components/sidebar-search/SidebarSearch';
import i18n from '@app/utils/i18n';

export interface IMenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: Array<IMenuItem>;
}

export const MENU: IMenuItem[] = [
  {
    name: i18n.t('menusidebar.label.dashboard'),
    icon: 'fas fa-tachometer-alt nav-icon',
    path: '/'
  },
 
  {
    name: i18n.t('menusidebar.label.Services'),
    icon: 'far fa-caret-square-down nav-icon',
    children: [
      {
        name: i18n.t('menusidebar.label.CrossPlatformServices'),
        icon: 'fas fa-server nav-icon',
        path: '/crossPlatformServices'
      },

      {
        name: i18n.t('menusidebar.label.MyOfferedServices'),
        icon: 'fas fa-external-link-alt nav-icon',
        path: '/myOfferedServices'
      }
      ,

      {
        name: i18n.t(  'menusidebar.label.Requests'),
        icon: 'fas fa-paper-plane nav-icon',
        path: '/requests'
      },

      {
        name: i18n.t('menusidebar.label.MySubscriptions'),
        icon: 'fas fa-newspaper nav-icon',
        path: '/mySubscriptions'
      }
    ]
  },

  {
    name: i18n.t('menusidebar.label.DataExchange'),
    icon: 'fas fa-exchange-alt nav-icon',
    children: [
      {
        name: i18n.t('menusidebar.label.ProvideData'),
        icon: 'fas fa-cloud-upload-alt nav-icon',
        path: '/provideData'
      },

      {
        name: i18n.t('menusidebar.label.ConsumeData'),
        icon: 'fas fa-cloud-download-alt nav-icon',
        path: '/consumeData'
      },
      /* {
        name: i18n.t('menusidebar.label.CompletedDataExchanges'),
        icon: 'fas fa-hammer nav-icon',
        path: '/sub-menu-1'
      }, */
      {
        name: i18n.t('menusidebar.label.DataExchangesTimeline'),
        icon: 'fas fa-stream nav-icon',
        path: '/timeline'
      }
    ]
  },

  {
    name: i18n.t('menusidebar.label.connectorSettings'),
    icon: 'fas fa-cogs nav-icon',
    path: '/connectorSettings'
  },

  
];

const StyledBrandImage = styled(PfImage)`
  float: left;
  line-height: 0.8;
  margin: -1px 8px 0 6px;
  opacity: 0.8;
  --pf-box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19),
    0 6px 6px rgba(0, 0, 0, 0.23) !important;
`;

const StyledUserImage = styled(PfImage)`
  --pf-box-shadow: 0 3px 6px #00000029, 0 3px 6px #0000003b !important;
`;

const MenuSidebar = () => {
  const authentication = useSelector((state: any) => state.auth.authentication);
  const sidebarSkin = useSelector((state: any) => state.ui.sidebarSkin);
  const menuItemFlat = useSelector((state: any) => state.ui.menuItemFlat);
  const menuChildIndent = useSelector((state: any) => state.ui.menuChildIndent);

  return (
    <aside className={`main-sidebar elevation-4 ${sidebarSkin}`}>
      <Link to="/" className="brand-link">
        <StyledBrandImage
          src="/img/Immagine 2024-01-05 153814.png"
          alt="AdminLTE Logo"
          width={33}
          height={33}
          rounded
        />
        <span className="brand-text font-weight-light" style={{marginLeft: '-8px', fontSize: '16px' }}>EnergyDataspace Connector</span>
      </Link>
      <div className="sidebar">
        <div className="user-panel mt-3 pb-3 mb-3 d-flex">
          <div className="image">
            <StyledUserImage
             
              fallbackSrc="/img/default-profile.png"
              alt="User"
              width={34}
              height={34}
              rounded
            />
          </div>
          <div className="info">
            <Link to="/profile" className="d-block">
              {localStorage.getItem("email")}
            </Link>
          </div>
        </div>

        <div className="form-inline">
          <SidebarSearch />
        </div>

        <nav className="mt-2" >
          <ul
            className={`nav nav-pills nav-sidebar flex-column${
              menuItemFlat ? ' nav-flat' : ''
            }${menuChildIndent ? ' nav-child-indent' : ''}`} 
            role="menu"
          >
            {MENU.map((menuItem: IMenuItem) => (
              <MenuItem
                key={menuItem.name + menuItem.path}
                menuItem={menuItem}
              />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default MenuSidebar;
