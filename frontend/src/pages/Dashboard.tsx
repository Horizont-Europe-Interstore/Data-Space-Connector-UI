import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ContentHeader, SmallBox } from '@app/components';
import Inner from '@app/components/helpers/InnerHtml';

interface DashboardData {
  id: string;
  createdOn: string;
  createdBy: string | null;
  version: string | null;
  shortOrder: number | null;
  description: string;
  dashboardAreaList: DashboardItem[];
  accessControlEnabled: boolean;
  accessControls: any[];
}

interface DashboardItem {
  id: string;
  createdOn: string | null;
  createdBy: string | null;
  version: string | null;
  shortOrder: number | null;
  cssclass: string;
  cssStyle: string;
  dashboardItemList: InfoCard[];
}

interface InfoCard {
  id: string;
  createdOn: string | null;
  createdBy: string | null;
  version: string | null;
  shortOrder: number | null;
  type: string;
  entityId: string;
  cssclass: string;
}

const Dashboard: React.FC = () => {
  const iconsArray= [
    "fas fa-cloud-download-alt ", 
    "fas fa-cloud-upload-alt",
    "fas fa-exchange-alt",
    "fas fa-user-plus",
    "fas fa-handshake",
    "fas fa-wifi"

  ]

  const addressArray = [
    "/consumeData",
    "/provideData",
    "/myOfferedServices",
    "/mySubscriptions",
    "/requests",
    "/connectorSettings"
    
  ]
  const [infoCards, setInfoCards] = useState<any[]>([]);
  if (localStorage.getItem("token")) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
  }

  useEffect(() => {
    axios.get<DashboardData>('/dashboard/by-id?id=b9b1394b-425c-4c33-a132-e28c23df995a', {
      
    })
      .then(response => {
        const dashboardAreaList = response.data.dashboardAreaList;
        const entityIds = dashboardAreaList.flatMap(area => area.dashboardItemList.map(item => item.entityId));

        return Promise.all(entityIds.map(entityId =>
          axios.get(`/info-card/by-id?id=${entityId}`, {
            
          })
        ));
      })
      .then(results => {
        const cards = results.map(res => res.data);
        setInfoCards(cards);
      })
      .catch(error => console.error('Errore durante il recupero dei dati', error));
  }, []);

  return (
    <div>
      <ContentHeader title="Dashboard" />

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {infoCards.map((card, index) => (
              <div key={index} className="col-lg-3 col-6">
                <SmallBox
                  
                  title={Inner(card.title)}
                  type="info"
                  count={Inner(card.cardText)}
                  icon= {iconsArray[index]}
                  textNavigateTo={Inner(card.description)}
                  navigateTo={addressArray[index]}

                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
