import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Header() {
  return (
    <Navbar collapseOnSelect expand="lg" className="headbg">
      <Container>
        <Navbar.Brand href="/">
          SolWallet
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="https://github.com/Vasanth14/" target="_blank" className="contbtnlink">
                <Button className='btn sitebtn'>Github
                </Button>
            </Nav.Link>
            <Nav.Link href="https://www.linkedin.com/in/vasanth-chandrasekar/" target="_blank" className="contbtnlink">
                <Button className='btn sitebtn'>Linkedin
                </Button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;