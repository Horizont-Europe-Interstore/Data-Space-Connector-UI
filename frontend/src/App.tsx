import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Main from '@modules/main/Main';
import Login from '@modules/login/Login';
import Register from '@modules/register/Register';
import ForgetPassword from '@modules/forgot-password/ForgotPassword';
import RecoverPassword from '@modules/recover-password/RecoverPassword';
import { useWindowSize } from '@app/hooks/useWindowSize';
import { calculateWindowSize } from '@app/utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { setWindowSize } from '@app/store/reducers/ui';
import MyOfferedServices from './pages/services/MyOfferedServices';
import Dashboard from '@pages/Dashboard';
import Blank from '@pages/Blank';
import CrossPlatformServices from './pages/services/CrossPlatformServices';
import SubMenu from '@pages/SubMenu';
import Profile from '@pages/profile/Profile';
import EditService from './pages/profile/EditService';
import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import { setAuthentication } from './store/reducers/auth';
import DetailedService from './pages/profile/DetailService';
import Requests from './pages/services/Requests';
import CreateService from './pages/profile/CreateService';
import MySubscriptions from './pages/services/MySubscriptions';
import EditSubscription from './pages/profile/EditSubscription';
import ConnectorSettings from './pages/services/ConnectorSettings';
import EditRequestedService from './pages/profile/EditRequestedService';
import ProvideData from './pages/dataExchange/ProvideData';
import EditDataEntity from './pages/profile/profileData/EditDataEntity';
import CreateDataEntity from './pages/profile/profileData/CreateDataEntity';
import ConsumeData from './pages/dataExchange/ConsumeData';
import DetailDataEntity from './pages/profile/profileData/DetailDataEntity';
import NewSubscription from './pages/profile/NewSubscription';
import TimelineTab from './pages/profile/TimelineTab';
import {
  getAuthStatus,
} from './utils/oidc-providers';
import axios from 'axios';
import setGlobalHeader from './components/helpers/SetGlobalHeader';
const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useSelector((state: any) => state.ui.screenSize);
  const dispatch = useDispatch();
  const [isAppLoading, setIsAppLoading] = useState(true);
  axios.defaults.baseURL = (window as any)["env"]["apiUrl"];
  const checkSession = async () => {
    try {
      let responses: any = await Promise.all([
        
        getAuthStatus(),
      ]);
      responses = responses.filter((r: any) => Boolean(r));

      if (responses && responses.length > 0) {
        dispatch(setAuthentication(responses[0]));
      }
    } catch (error: any) {
      console.log('error', error);
    }
    setIsAppLoading(false);
  };

  useEffect(() => {
    checkSession();
    if (localStorage.getItem("token")){
      setGlobalHeader();
    }
    
  }, []);

  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize]);

  if (isAppLoading) {
    return <p>Loading</p>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/register" element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/forgot-password" element={<PublicRoute />}>
          <Route path="/forgot-password" element={<ForgetPassword />} />
        </Route>
        <Route path="/recover-password" element={<PublicRoute />}>
          <Route path="/recover-password" element={<RecoverPassword />} />
        </Route>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Main />}>
            <Route path="/sub-menu-2" element={<Blank />} />
            <Route path="/sub-menu-1" element={<SubMenu />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/crossPlatformServices" element={<CrossPlatformServices />} />
            <Route path="/myOfferedServices" element={<MyOfferedServices />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/editService" element={<EditService />} />

            <Route path="/detailedService" element={<DetailedService />} />
            <Route path="/createService" element={<CreateService />} />

            <Route path="/requests" element={<Requests />} />
           
            <Route path="/editRequestedService" element={<EditRequestedService />} />
            <Route path="/mySubscriptions" element={<MySubscriptions />} />


            <Route path="/newSubscription" element={<NewSubscription />} />

            
            <Route path="/editSubscription" element={<EditSubscription />} />
            <Route path="/connectorSettings" element={<ConnectorSettings />} />

            <Route path="/provideData" element={<ProvideData />} />
            <Route path="/editDataEntity" element={<EditDataEntity />} />
            <Route path="/createDataEntity" element={<CreateDataEntity />} />
            <Route path="/consumeData" element={<ConsumeData />} />
            <Route path="/detailDataEntity" element={<DetailDataEntity />} />
            <Route path="/timeline" element={<TimelineTab isActive={true} />} />

            <Route path="/" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        autoClose={3000}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
    </BrowserRouter>
  );
};

export default App;
