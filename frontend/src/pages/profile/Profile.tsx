import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentHeader } from '@components';
import { PfButton, PfImage } from '@profabric/react-components';
import styled from 'styled-components';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ActivityTab from './ActivityTab';
import TimelineTab from './TimelineTab';
import SettingsTab from './SettingsTab';
import { Card, Table } from 'react-bootstrap';
interface PageInfo {
  username: string;
  email: string;
}
const StyledUserImage = styled(PfImage)`
  --pf-border: 3px solid #adb5bd;
  --pf-padding: 3px;
`;

const Profile = () => {
  const [activeTab, setActiveTab] = useState('ACTIVITY');
  const [t] = useTranslation();
  const [pageInfo, setPageInfo] = useState<PageInfo>({ username: '', email: '' });
  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState<string>('');

  const toggle = (tab: string) => {

    if (activeTab !== tab) setActiveTab(tab);
  };
  axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
  useEffect(() => {

    axios.get(`/user/current`)
      .then(response => {
        const data = response.data

        setPageInfo({
          username: data.username,
          email: data.email
        });

      })
      .catch(error => {
        console.error('Error fetching media:', error);
      });

  }, []);


  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };
  const handlePasswordChangeRepeat = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPasswordRepeat(e.target.value);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updatePassword();
  };

  const updatePassword = () => {

    axios.put('/user/change-password', { username: pageInfo.username, password: newPassword, repeatPassword: newPasswordRepeat })
      .then(response => {
        console.log('Password updated successfully:', response);
      })
      .catch(error => {
        console.error('Error updating password:', error);
      });
  };

  return (
    <>
      <Card>
        <h3 className="list-group-item-heading" style={{ padding: "10px 20px" }}><b><i className="fas fa-user" style={{paddingRight:"8px"}}></i>Profile</b></h3>
        <section className="content">
          <div className="container-fluid">
            <div className="col">
              <div className="card">

                <Table striped bordered hover style={{ width: '100%', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th >Username</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{pageInfo.username}</td>
                      <td>{pageInfo.email}</td>
                    </tr>
                  </tbody>
                </Table>
                <div className="card-body">
                  <Form onSubmit={handleSubmit}>
                    <div className="row">

                      <div className="col mb-3">
                        <Form.Group className="mb-3" controlId="formBasicPassword">
                          <Form.Label>Enter new password</Form.Label>
                          <Form.Control type="password" placeholder="Enter new password" value={newPassword} onChange={handlePasswordChange} />
                        </Form.Group>
                      </div>
                      <div className="col mb-1">
                        <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                          <Form.Label>Confirm new password</Form.Label>
                          <Form.Control type="password" placeholder="Confirm new password" value={newPasswordRepeat} onChange={handlePasswordChangeRepeat} />
                          <Form.Text className="text-muted">
                            Use the same password to show the submit button
                          </Form.Text>
                        </Form.Group>
                      </div>
                    </div>
                  </Form><div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div>
                      {newPassword === newPasswordRepeat && newPassword!== "" &&
                        <Button variant="primary" type="submit" onClick={() => updatePassword()} >
                          Save
                        </Button>
                      }
                      {newPassword != newPasswordRepeat || newPassword=== "" &&
                        <Button variant="primary" type="submit" onClick={() => updatePassword()} disabled>
                          Save
                        </Button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </Card>
    </>
  );
};

export default Profile;
