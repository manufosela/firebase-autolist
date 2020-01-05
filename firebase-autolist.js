import { LitElement, html, css } from 'lit-element';
import {} from '@polymer/paper-spinner/paper-spinner.js';
import 'firebase/firebase-app';
import 'firebase/firebase-database';

/**
 * `firebase-autolist`
 * FirebaseAutolist
 *
 * @customElement firebase-autolist
 * @polymer
 * @litElement
 * @demo demo/index.html
 */

class FirebaseAutolist extends LitElement {
  static get is() {
    return 'firebase-autolist';
  }

  static get properties() {
    return {
      path: {
        type: String
      },
      fieldKey: {
        typer: String,
        attribute: 'field-key'
      },
      data: {
        type: Object
      },
      dataUser: {
        type: Object
      }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      paper-spinner.blue::shadow .circle {
        border-color: var(--spinner-color, #4285f4);
      }
    `;
  }

  constructor() {
    super();
    this.path = '/';
    this.fieldKey = 'id';

    this.data = null;
    this.dataUser = null;
    this.bLog = false;
  }

  log(msg) {
    if (this.bLog) {
      console.log(msg);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('firebase-signin', (e) => {
      this.user = e.detail.user.displayName;
      this.dataUser = e.detail.user;
      this.getData();
    });
    document.addEventListener('firebase-signout', (e) => {
      this.dataUser = null;
      this.data = null;
    });
  }

  getData() {
    let starredStatusRef = firebase.database().ref(this.path);
    starredStatusRef.on('value', (snapshot) => {
      this.data = snapshot.val();
      this._getData();
    });
  }

  _getData() {
    let data = this.data;
    this.shadowRoot.querySelector('#elements-layer').innerHTML = '';
    data.forEach((elem, id) => {
      this.log(JSON.stringify(elem) + ' - ' + id);
      const liEl = document.createElement('li');
      liEl.innerHTML = `<a href='#' name='${id}'>[${id}] ${elem[this.fieldKey]}</a>`;
      this.shadowRoot.querySelector('#elements-layer').appendChild(liEl);
    });
    this.shadowRoot.querySelectorAll('#elements-layer a').forEach((el)=> {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        document.dispatchEvent(new CustomEvent('firebase-autoform-selectid', {detail: {id: ev.target.name}}));
      });
    });
    this.shadowRoot.querySelector('#spinner').active = false;
  }

  render() {
    return html`
      ${this.dataUser !== null ? html` 
        <h3 class='path'>${this.path.replace(/^\//, '')} <paper-spinner id="spinner" class="blue" active></paper-spinner></h3>
        <div class="container">
          <section>
            <ul id="elements-layer">
            </ul>
          </section>
        </div>
      ` : html`<div class="waiting">Waiting for login...</div>`}
    `;
  }
}

window.customElements.define(FirebaseAutolist.is, FirebaseAutolist);