const NewPushService = () => {
  window.location.href = '/createPushService'
};

const NewDataService = () => {
  window.location.href = '/createDataService'
};

const DetailService = (id: string) => {
  window.location.href = `/detailedService?id=${id}`

};

const EditService = (id: string, whoIsCalling: string) => {
  window.location.href = `/editService?id=${id}&whoIsCalling=${whoIsCalling}`
};

const EditRequest = (id: string) => {
  window.location.href = `/editRequestedService?id=${id}`
};

const RequestsOnService = (id: string) => {
  window.location.href = `/requests?id=${id}`
};

const EditSubscription = (id: string) => {
  window.location.href = `/editSubscription?id=${id}`
};
const NewSubscription = (type: string) => {
  window.location.href = `/newSubscription?type=${type}`
};

const EditDataEntity = (id: string) => {
  window.location.href = `/editDataEntity?id=${id}`
};

const NewDataEntity = () => {
  window.location.href = `/createDataEntity`
};
const NewDataEntityPush = () => {
  window.location.href = `/createDataEntityPush`
};

const DetailDataEntity = (id: string) => {
  window.location.href = `/detailDataEntity?id=${id}`
};





export { EditService, EditRequest, RequestsOnService, DetailService, NewPushService, NewDataService, EditSubscription, EditDataEntity, NewDataEntity, NewDataEntityPush, DetailDataEntity, NewSubscription }; 