import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-spinner/paper-spinner.js';
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

export class FirebaseAutolist extends LitElement {
  static get is() {
    return 'firebase-autolist';
  }

  static get properties() {
    return {
      path: {
        type: String
      },
      showId: {
        type: Boolean,
        attribute: 'show-id'
      },
      fieldKey: {
        typer: String,
        attribute: 'field-key'
      },
      valSelected: {
        type: String,
        attribute: 'val-selected'
      },
      selectView: {
        type: Boolean,
        attribute: 'select-view'
      },
      height: {
        type: Number,
        attribute: 'height'
      },
      autoRefresh: {
        type: Boolean,
        attribute: 'auto-refresh'
      },
      showDelete: {
        type: Boolean,
        attribute: 'show-delete'
      },
      search: {
        type: Boolean
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
    /*
      CSS-VARIABLES
      --font-size: 1rem
      --link-hover: #0A7CAF
      --selected-color: #F30
      --selected-bg: #888
    */
    return css`
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
  }

  constructor() {
    super();
    this.path = '';
    this.fieldKey = '';
    this.showId = false;
    this.valSelected = '';
    this.search = false;
    this.height = 0;
    this.autoRefresh = false;
    this.showDelete = false;

    this.data = null;
    this.dataUser = null;
    this.bLog = false;

    this._isSignIn = this._isSignIn.bind(this);
    this._isSignOut = this._isSignOut.bind(this);
    this._selectedElement = this._selectedElement.bind(this);
    this._setCssElement = this._setCssElement.bind(this);
    this._deleteElement = this._deleteElement.bind(this);
    this._closeModal = this._closeModal.bind(this);
  }

  log(msg) {
    if (this.bLog) {
      console.log(msg);
    }
  }

  _isSignIn(ev) {
    if (!this.user) {
      this._userLogged(ev);
      this.getData();
    }
  }

  _isSignOut(ev) {
    this._userLogout(ev);
  }

  _setCssElement(ev) {
    if (ev.detail && ev.detail.id === this.id) {
      if (ev.detail.name && ev.detail.style) {
        const selector = ev.detail.name;
        const style = ev.detail.style;
        if (this.shadowRoot.querySelector(selector)) {
          this.shadowRoot.querySelector(selector).style = style;
        }
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('firebase-signin', this._isSignIn);
    document.addEventListener('firebase-signout', this._isSignOut);
    document.addEventListener('setcss-autolist-element', this._setCssElement);
    const firebaseAreYouLoggedEvent = new CustomEvent('firebase-are-you-logged');
    document.dispatchEvent(firebaseAreYouLoggedEvent);
  }

  disconnectedCallback() {
    document.removeEventListener('firebase-signin', this._isSignIn);
    document.removeEventListener('firebase-signout', this._isSignOut);
    document.removeEventListener('setcss-autolist-element', this._setCssElement);
    document.removeEventListener('click', this._closeModal);
    this.shadowRoot.querySelectorAll('#elements-layer a.element').forEach((el)=> {
      el.removeEventListener('click', this._selectedElement);
    });
    this.shadowRoot.querySelectorAll('#elements-layer a.deleteBtn').forEach((el)=> {
      el.removeEventListener('click', this._deleteElement);
    });
    super.disconnectedCallback();
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'path' && this.elId !== oldValue && oldValue !== undefined) {
        this.getData();
      }
    });
  }

  processData(snapshot) {
    this.data = snapshot.val();
    if (this.data) {
      this._getData();
    } else {
      this.shadowRoot.querySelector('#elements-layer').innerHTML = 'No data found';
    }
    const id = this.id || this.name || 'firebase-autoform-without-id';
    const firebaseAutolistFinish = new CustomEvent('firebase-autolist-finish', {detail: {id: id}});
    document.dispatchEvent(firebaseAutolistFinish);
  }

  getData() {
    if (this.path !== '') {
      let starredStatusRef = firebase.database().ref(this.path);
      if (this.autoRefresh) {
        starredStatusRef.on('value', (snapshot) => this.processData(snapshot));
      } else {
        starredStatusRef.once('value').then((snapshot) => this.processData(snapshot));
      }
    } else {
      this.log('path not defined');
    }
  }

  deleteIdFromFirebase(id) {
    const path = (this.path[this.path.length - 1] === '/') ? this.path : this.path + '/';
    console.log(path + id);
    const ref = firebase.database().ref(path + id);
    ref.remove((error)=> {
      if (error === null) {
        this.getData();
      }
    });
  }

  _userLogged(obj) {
    if (!this.user && obj.detail.user) {
      this.user = obj.detail.user.displayName;
      this.dataUser = obj.detail.user;
    }
  }

  _userLogout() {
    this.dataUser = null;
    this.data = null;
  }

  _selectedElement(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    document.dispatchEvent(new CustomEvent('firebase-autolist-selectid', {detail: {id: ev.target.name, objId: this.id, value: ev.target.value}}));
    const arrayLink = this.shadowRoot.querySelectorAll('#elements-layer li a.element');
    for (let link of arrayLink) {
      link.classList.remove('selected');
    }
    ev.target.classList.add('selected');
  }

  _closeModal(ev) {
    const modal = this.shadowRoot.querySelector('#modal-delete-element');
    if (modal) {
      modal.remove();
    }
  }

  _createModal(ev) {
    const modal = document.createElement('div');
    modal.id = 'modal-delete-element';
    modal.classList.add('modal');
    modal.style.top = ev.clientY + 'px';
    modal.style.left = ev.clientX + 'px';
    return modal;
  }

  _deleteElement(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this._closeModal();
    const field = ev.target.title.replace('delete ', '');
    const id = ev.target.dataset.id;
    const modal = this._createModal(ev);
    modal.innerHTML = `
      <div data-id="${id}">¿Quieres borrar el elemento ${field}?</div>
      <button id="deleteSi">Sí</button><button id="deleteNo">No</button>
    `;
    this.shadowRoot.appendChild(modal);
    document.addEventListener('click', this._closeModal);
    this.shadowRoot.querySelector('#deleteSi').addEventListener('click', () => this.deleteIdFromFirebase(id));
  }

  _getData() {
    this.shadowRoot.querySelector('#elements-layer').innerHTML = '';
    if (this.fieldKey === '') {
      this._getDataKeys();
    } else {
      this._getDataFields();
    }

    this.shadowRoot.querySelectorAll('#elements-layer a.element').forEach((el)=> {
      el.addEventListener('click', this._selectedElement);
    });
    this.shadowRoot.querySelectorAll('#elements-layer a.deleteBtn').forEach((el)=> {
      el.addEventListener('click', this._deleteElement);
    });
    this.shadowRoot.querySelector('#spinner').active = false;
  }

  _getDataFields() {
    let data = this.data;
    if (Array.isArray(data)) {
      data.shift();
      data.forEach((elem, id) => {
        id++; // Porque eliminamos el elemento 0 que es que se usa de referencia
        this.log(JSON.stringify(elem) + ' - ' + id);
        const classSelect = (this.valSelected === elem[this.fieldKey]) ? 'class="selected"' : '';
        const liEl = document.createElement('li');
        const deleteBtn = (this.showDelete) ? `<a class="deleteBtn" data-id="${id}" title="delete ${elem[this.fieldKey]}">X</a>` : '';
        liEl.innerHTML = `<a href='#' ${classSelect} class="element" name='${id}'>${(this.showId) ? `[${id}]` : ''} ${elem[this.fieldKey]}</a>${deleteBtn}`;

        this.shadowRoot.querySelector('#elements-layer').appendChild(liEl);
      });
    } else {
      this._getDataKeys(this.fieldKey);
    }
  }

  _getDataKeys(id) {
    let data = (id) ? this.data[id] : this.data;
    let keys = Object.keys(data);
    for (let elem of keys) {
      this.log(elem);
      if (elem !== '0' || ['string', 'number'].includes(typeof(data[elem]))) {
        const value = ['string', 'number'].includes(typeof(data[elem])) ? data[elem] : elem;
        const liEl = document.createElement('li');
        const classSelect = (this.valSelected === value) ? 'class="element selected"' : '';
        const deleteBtn = (this.showDelete) ? `<a class="deleteBtn" data-id="${elem}" title="delete ${value}">X</a>` : '';
        liEl.innerHTML = `<a href='#' ${classSelect} class="element" name='${elem}'>${value}</a>${deleteBtn}`;
        this.shadowRoot.querySelector('#elements-layer').appendChild(liEl);
      }
    }
  }

  render() {
    const path = this.path.split('/');
    const height = (this.height > 0 && this.height <= 100) ? 'height:' + this.height + 'vh; overflow-y: scroll; overflow-x: hidden;' : '';
    return html`
      ${this.dataUser !== null ? html` 
        ${this.search ? html`<input type="text" name="search">` : html``}
        ${(this.path !== '') ? html`<h3 class='path'>${path[path.length - 1].replace('/_/g', ' ')} <paper-spinner id="spinner" class="blue" active></paper-spinner></h3>` : html``}
        <div style="${height}">
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