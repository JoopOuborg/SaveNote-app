// alle functionaliteit gaat in deze class

class App {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('savenotes')) || [];
        this.title = '';
        this.text = '';
        this.id = '';
        
        
        this.$notes = document.querySelector("#notes");
        this.$form = document.querySelector("#form");
        this.$noteTitle = document.querySelector("#note-title");
        this.$noteText = document.querySelector('#note-text');
        this.$formButtons = document.querySelector("#form-buttons");
        this.$placeholder = document.querySelector("#placeholder");
        this.$formCloseButton = document.querySelector("#form-close-button");
        this.$modal = document.querySelector('.modal');
        this.$modalTitle = document.querySelector(".modal-title");
        this.$modalText = document.querySelector(".modal-text");
        this.$modalCloseButton = document.querySelector(".modal-close-button");
        this.$colorTooltip = document.querySelector('#color-tooltip');
        this.render();
        this.addEventListeners();
    }
    
    addEventListeners() {
        document.body.addEventListener('click', event =>
        {
            this.handleFormClick(event);
            this.selectNote(event);    
            this.openModal(event);
            this.deleteNote(event);
           
        }        
        )
        
        document.body.addEventListener('mouseover', event => {
            this.openTooltip(event)}
        )
        
        document.body.addEventListener('mouseout', event => {
            this.closeTooltip(event)}
        )
        
        this.$colorTooltip.addEventListener('mouseover', function() {
            this.style.display = 'flex'
        })
        
        this.$colorTooltip.addEventListener('mouseout', function() {
            this.style.display = 'none'
        })
        
         this.$colorTooltip.addEventListener('click', event => {
            const color = event.target.dataset.color; 
            if (color) {
                this.editNoteColor(color);  
            }
            })
        
        this.$form.addEventListener('submit', event => {
            event.preventDefault();
            const title = this.$noteTitle.value;
            const text = this.$noteText.value;
            // check of er text of title is ingevoerd:
            const hasNote = title || text;
            if (hasNote) {
                // lokale titel en text in een object =naar de functie
                // title: title === title
                // text: text === text
                this.addNote({title, text})
            }
        })
        
        this.$formCloseButton.addEventListener('click', event => {
            // stopPropagation() voorkomt 'bubbling'
            // i.e. conflict tussen eventhandlers van hetzelfde type
            event.stopPropagation();
            this.closeForm();
        })
        
        this.$modalCloseButton.addEventListener('click', event =>
            this.closeModal(event)
        )
        
       
    }
    
    handleFormClick(event) {
        // bepaal of event komt van binnen de form:
       const isFormClicked = this.$form.contains(event.target);
       const title = this.$noteTitle.value;
       const text = this.$noteText.value;
            // check of er text of title is ingevoerd:
       const hasNote = title || text;
        
       if (isFormClicked) {
           this.openForm()
       } else if (hasNote) {
           this.addNote({title, text});
       } else {
           this.closeForm()
       }
    }
    
    openForm() {
        this.$form.classList.add("open-form");
        this.$noteTitle.style.display = "block";
        this.$formButtons.style.display = "block";
    }
    
    closeForm() {
        this.$form.classList.remove("open-form");
        this.$noteTitle.style.display = "none";
        this.$formButtons.style.display = "none"; 
        this.$noteTitle.value = "";
        this.$noteText.value = "";
    }
    
    openModal(event) {
        if (event.target.matches(".toolbar-delete")) return;
        if(event.target.closest('.note')) {
            this.$modal.classList.toggle("open-modal");
            this.$modalTitle.value = this.title;
            this.$modalText.value = this.text;
        }
    }
    
    closeModal() {
        this.editNote();
        this.$modal.classList.toggle("open-modal");            
    }
    
    
    // dit werkt nog niet zoals het zou moeten
    openTooltip(event) {
        event.stopPropagation();
         if (!event.target.matches('.toolbar-color')) return;
         this.id = event.target.dataset.id; 
         const noteCoords = event.target.getBoundingClientRect();
         // In VScode kunnen onderstaande regels vervangen worden door:
         // const horizontal = noteCoords.left + scrollX;
         // const vertical = noteCoords.top + scrollY;
         const horizontal = noteCoords.left - 110;
         const vertical = scrollY -22;
         this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`;
         this.$colorTooltip.style.display = 'flex';
        
    }
    
    closeTooltip(event) {
        if (!event.target.matches('.toolbar-color')) return;
        this.$colorTooltip.style.display = 'none';
    }
    
    selectNote(event) {       
        const $selectedNote = event.target.closest('.note');
        if (!$selectedNote) return;
        // date is 1e, title 2e, en text 3e child
        const [,$noteTitle, $noteText] = $selectedNote.children;
        this.title = $noteTitle.innerText;
        this.text = $noteText.innerText;
        this.id = $selectedNote.dataset.id;
    }
    
    addNote(note) {
        // datum, kleur en id worden toegevoegd
        const date = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        
        const newNote = {
            title: note.title,
            text: note.text,
            date: date.toLocaleString("nl-NL", options),
            color: "white",
            // voor de id gebruiken we de lengte van de array
            // nadat we gechecked hebben dat er iets in de array staat
            // d.i. this.notes.length > 0
            // zo ja, dan neem de id van het laatste element vd array
            // en tel daar 1 bij op
            // zo nee, dan is id gewoon 1 (eerste element)
            id: this.notes.length > 0 ? this.notes[this.notes.length -1].id + 1 : 1
        }
        this.notes = [...this.notes, newNote];
        this.render();
        
    }
    
    editNote() {
        const title = this.$modalTitle.value;
        const text = this.$modalText.value;
         this.notes = this.notes.map(note => {
            if (note.id === Number(this.id)) {
               return {...note,
                        title,
                        text} 
            } else {
               return note 
            }
        })
        this.render();      
    }
    
    editNoteColor(color) {
        this.notes = this.notes.map(note =>
        note.id === Number(this.id) ? { ...note, color } : note
        );
        this.render();
    }
    
     deleteNote(event) {
        event.stopPropagation();
        if (!event.target.matches('.toolbar-delete')) return;
        const id = event.target.dataset.id;
        this.notes = this.notes.filter(note => note.id !== Number(id));
        this.render();
    }
    
    render() {
        this.saveNotes();
        this.displayNotes();
    }
    
    saveNotes() {
        localStorage.setItem('savenotes', JSON.stringify(this.notes))
    }
    
    displayNotes() {
        // check eerst of er notes zijn
        // zo ja, verberg de placeholder
        // zo nee, zet de placeholder to flex
        this.$placeholder.style.display = this.notes.length > 0 ?
                "none": "flex";
        this.$notes.innerHTML =  this.notes.map(note => `
        <div style="background: ${note.color};" class="note" data-id=${note.id}>
          <div class="note-date">${note.date}</div>
          <div class="${note.title && 'note-title'}">${note.title}</div>
          <div class="note-text">${note.text}</div>
          <div class="toolbar-container">
            <div class="toolbar">
              <img class="toolbar-color" src="./images/palette.png"
              data-id=${note.id}>
              <img class="toolbar-delete" src="./images/trash.png"
              data-id=${note.id}>
            </div>
          </div>
        </div>
     `).join("");
        this.closeForm();
        
    }
}

new App()

// src="https://cdn-icons-png.flaticon.com/512/1214/1214594.png"
// src="https://cdn-icons-png.flaticon.com/512/167/167723.png"