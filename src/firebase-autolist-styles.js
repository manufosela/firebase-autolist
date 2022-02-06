import { css } from 'lit';

export const firebaseAutoListStyles = css`
  /*
    CSS-VARIABLES
    --font-size: 1rem
    --link-hover: #0A7CAF
    --selected-color: #F30
    --selected-bg: #888
  */

  :host {
    display: block;
  }
  paper-spinner.blue::shadow .circle {
    border-color: var(--spinner-color, #4285f4);
  }
  ul{
    margin:0px;
    padding:0;
  }
  li{
    font-size:var(--font-size,1rem);
    padding:0px;
    list-style:none;
    line-height:30px;
  }
  li a{
  text-decoration:none;
  }
  li a.element:hover, .selected{
    color:var(--link-hover, #0A7CAF);
    padding:5px;
    -moz-box-shadow: 0px 0px 12px #9e9ea3;
    -webkit-box-shadow: 0px 0px 12px #9e9ea3;
    box-shadow: 0px 0px 12px #9e9ea3;
    border:none 0px #000000;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    border-radius: 3px;
    font-size:110%;
  }
  .selected {
    color: var(--selected-color, #F30);
    background: var(--selected-bg, #888);
  }
  .deleteBtn {
    font-size: 0.7rem;
    position: relative;
    top: -12px;
    cursor: pointer;
  }
  .modal {
    position: absolute;
    width: 150px;
    background: #FFF;
    font-size: 1rem;
    border: 3px outset;
    border-radius: 10px;
    padding: 5px;
  }
`;