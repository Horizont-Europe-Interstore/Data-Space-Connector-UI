import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { setAuthentication } from '@store/reducers/auth';
import { setWindowClass } from '@app/utils/helpers';
import { PfCheckbox, PfButton } from '@profabric/react-components';
import axios from 'axios';
import {
  authLogin,
} from '@app/utils/oidc-providers';
import { Form, InputGroup } from 'react-bootstrap';

const imageUrl = "./img/map-labs.jpg";
const Login = () => {
  const [isAuthLoading, setAuthLoading] = useState(false);
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [t] = useTranslation();
  
  const login = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      const response = await authLogin(email, password);
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem("email", email)
      dispatch(setAuthentication(response as any));
      toast.success('Login is succeed!');
      setAuthLoading(false);
      // dispatch(loginUser(token));
      navigate('/');
    } catch (error: any) {
      setAuthLoading(false);
      toast.error(error.message || 'Failed');
    }
  };
  const { handleChange, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    // validationSchema: Yup.object({
    //   email: Yup.string().email('Invalid email address').required('Required'),
    //   password: Yup.string()
    //     .min(5, 'Must be 5 characters or more')
    //     .max(30, 'Must be 30 characters or less')
    //     .required('Required'),
    // }),
    onSubmit: (values) => {
      login(values.email, values.password);
    },
  });

  setWindowClass('hold-transition login-page');

  return (
    <div style={{ backgroundImage: `url(${imageUrl})`,  display: 'flex',justifyContent: 'center',  backgroundSize: 'cover',alignItems: 'center', backgroundPosition: 'center',  width: '100%',height: '100%' }}>
    <div className="login-box" >
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <Link to="/" className="h4">
            <b>Energy Data Space</b>
            <span> Connector</span>
          </Link>
        </div>
        <div className="card-body">
          <p className="login-box-msg" >{t<string>('login.label.signIn')}</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="email"
                  name="email"
      
                  placeholder="Username"
                  onChange={handleChange}
                  value={values.email}
                  isValid={touched.email && !errors.email}
                  isInvalid={touched.email && !!errors.email}
                />
                {touched.email && errors.email ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-user" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={values.password}
                  isValid={touched.password && !errors.password}
                  isInvalid={touched.password && !!errors.password}
                />
                {touched.password && errors.password ? (
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-lock" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>
            <div className="row">
              <div className="col-8">
               {/*  <PfCheckbox checked={false}>
                  {t<string>('login.label.rememberMe')}
                </PfCheckbox> */}
              </div>
              <div className="col-4">
                <PfButton
                  block
                  type="submit"
                  loading={isAuthLoading}
                //disabled={isFacebookAuthLoading || isGoogleAuthLoading}
                >
                  {t<string>('login.button.signIn.label')}
                </PfButton>
              </div>
            </div>
          </form>
          {/*   <p className="mb-1">
            <Link to="/forgot-password">
              {t<string>('login.label.forgotPass')}
            </Link>
          </p>
          <p className="mb-0">
            <Link to="/register" className="text-center">
              {t<string>('login.label.registerNew')}
            </Link>
          </p> */}
        </div>
      </div>
    </div></div>
  );
};

export default Login;



