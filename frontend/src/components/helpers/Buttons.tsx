const New = () => {
  window.location.href = '/createService'
};

const DetailService = (id: string) => {
  window.location.href = `/detailedService?id=${id}`

};

const EditService = (id: string) => {
  window.location.href = `/editService?id=${id}`
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
const NewSubscription = () => {
  window.location.href = `/newSubscription`
};

const EditDataEntity = (id: string) => {
  window.location.href = `/editDataEntity?id=${id}`
};
const NewDataEntity = () => {
  window.location.href = `/createDataEntity`
};

const DetailDataEntity = (id: string) => {
  window.location.href = `/detailDataEntity?id=${id}`
};





export { EditService, EditRequest, RequestsOnService, DetailService, New, EditSubscription, EditDataEntity, NewDataEntity, DetailDataEntity, NewSubscription }; 