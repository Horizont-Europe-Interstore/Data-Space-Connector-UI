import React, {useState, useEffect, useCallback} from 'react';
import {Outlet} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {toggleSidebarMenu} from '@app/store/reducers/ui';
import {addWindowClass, removeWindowClass, sleep} from '@app/utils/helpers';
import ControlSidebar from '@app/modules/main/control-sidebar/ControlSidebar';
import Header from '@app/modules/main/header/Header';
import MenuSidebar from '@app/modules/main/menu-sidebar/MenuSidebar';
import Footer from '@app/modules/main/footer/Footer';
import {PfImage} from '@profabric/react-components';

const Main = () => {
  const dispatch = useDispatch();
  const menuSidebarCollapsed = useSelector(
    (state: any) => state.ui.menuSidebarCollapsed
  );
  const controlSidebarCollapsed = useSelector(
    (state: any) => state.ui.controlSidebarCollapsed
  );
  const screenSize = useSelector((state: any) => state.ui.screenSize);
  const authentication = useSelector((state: any) => state.auth.authentication);
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  const handleToggleMenuSidebar = () => {
    dispatch(toggleSidebarMenu());
  };

  useEffect(() => {
    setIsAppLoaded(Boolean(authentication));
  }, [authentication]);

  useEffect(() => {
    removeWindowClass('register-page');
    removeWindowClass('login-page');
    removeWindowClass('hold-transition');

    addWindowClass('sidebar-mini');

    // fetchProfile();
    return () => {
      removeWindowClass('sidebar-mini');
    };
  }, []);

  useEffect(() => {
    removeWindowClass('sidebar-closed');
    removeWindowClass('sidebar-collapse');
    removeWindowClass('sidebar-open');
    if (menuSidebarCollapsed && screenSize === 'lg') {
      addWindowClass('sidebar-collapse');
    } else if (menuSidebarCollapsed && screenSize === 'xs') {
      addWindowClass('sidebar-open');
    } else if (!menuSidebarCollapsed && screenSize !== 'lg') {
      addWindowClass('sidebar-closed');
      addWindowClass('sidebar-collapse');
    }
  }, [screenSize, menuSidebarCollapsed]);

  useEffect(() => {
    if (controlSidebarCollapsed) {
      removeWindowClass('control-sidebar-slide-open');
    } else {
      addWindowClass('control-sidebar-slide-open');
    }
  }, [screenSize, controlSidebarCollapsed]);

  const getAppTemplate = useCallback(() => {
    if (!isAppLoaded) {
      return (
        <div className="preloader flex-column justify-content-center align-items-center">
          <PfImage
            className="animation__shake"
            src="/img/twineu-logo.png"
            alt="EnergyDataspace Connector"
            height={60}
            width={60}
          />
        </div>
      );
    }
    return (
      <>
        <Header  />

        <MenuSidebar />

        <div className="content-wrapper">
          <div className="pt-3" />
          <section className="content" >
            <Outlet />
          </section>
        </div>
        <Footer /> 
        {/* <ControlSidebar /> */}
        <div
          id="sidebar-overlay"
          role="presentation"
          onClick={handleToggleMenuSidebar}
          onKeyDown={() => {}}
        />
      </>
    );
  }, [isAppLoaded]);

  return <div className="wrapper">{getAppTemplate()}</div>;
};

export default Main;
