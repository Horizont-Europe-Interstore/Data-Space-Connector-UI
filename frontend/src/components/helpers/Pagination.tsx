
interface PaginationProps {
    totalPages: number;
    paginate: (pageNumber: number) => void;
    currentPage: number;
  }
const Pagination: React.FC<PaginationProps> = ({ totalPages, paginate, currentPage }) => {
    const pageNumbers: number[] = [];
    for (let i = 1; i <= totalPages ; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav>
        <ul className='pagination'>
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <a href="#!" onClick={() => paginate(number)} className='page-link'>
                {number}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  export default Pagination;