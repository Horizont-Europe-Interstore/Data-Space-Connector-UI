
interface PaginationProps {
    totalPages: number;
    paginate: (pageNumber: number) => void;
    currentPage: number;
  }
const Pagination: React.FC<PaginationProps> = ({ totalPages, paginate, currentPage }) => {
    const pageNumbers: number[] = [];
    let startingPage = 1
    let finalpage = currentPage +5
    if (currentPage >5)
      startingPage=currentPage-5
    if (finalpage > totalPages)
      finalpage = finalpage - (finalpage - totalPages)
    for (let i = startingPage; i <= finalpage ; i++) {
      pageNumbers.push(i);
    }

    
    return (
      <nav>
        <ul className='pagination'>
          <a href="#!" onClick={() => paginate(1)} className='page-link'><i className="fa fa-angle-double-left"></i> </a>
          {currentPage >5 &&<a href="#!" onClick={() => paginate(currentPage-5)} className='page-link' ><i className="fa fa-angle-left"></i> </a>}
          {currentPage <= 5 &&<a href="#!" className='page-link' style={{color: "#b3b3b3"}}><i className="fa fa-angle-left"></i> </a>}
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <a href="#!" onClick={() => paginate(number)} className='page-link'>
                {number}
              </a>
            </li>
          ))}
           {currentPage < totalPages -4 &&<a href="#!" onClick={() => paginate(currentPage+5)}  className='page-link'><i className="fa fa-angle-right"></i> </a>}
          {currentPage >= totalPages -4 &&<a href="#!"  className='page-link' style={{color: "#b3b3b3"}}><i className="fa fa-angle-right"></i> </a>}
          <a href="#!" onClick={() => paginate(totalPages)} className='page-link'><i className="fa fa-angle-double-right"></i> </a>
        </ul>
      </nav>
    );
  };

  export default Pagination;