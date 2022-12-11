import './App.css';
import React, { useState, useEffect } from 'react' ;
import Preview from './components/Preview';
import Message from './components/Message';
import NotesContainer from './components/Notes/NotesContainer';
import NotesList from './components/Notes/NotesList';
import Note from './components/Notes/Note';
import NoteForms from './components/Notes/NoteForms';
import Alert from './components/Alert';




function App() {


//قسم تعريف متغيرات الحالات او الخطافات
const [notes,setNotes] =useState([]);
const [title,setTitle] =useState('');
const [content,setContent] =useState('');
const [selectedNote,setSelectedNote] =useState(null);
const [creating,setCreating] =useState(false);
const [editing,setEditing] =useState(false);
const [validationErrors,setValidationErrors] = useState([]);


//دالة التحقق من التخزين المحلي
useEffect(()=>{
if(localStorage.getItem('notes')){
  setNotes(JSON.parse(localStorage.getItem('notes')));
}else{
  localStorage.setItem('notes',JSON.stringify([]));
}
},
[]
);

//اخفاء تنبيه المحتوى الفاؤ=رغ بعد 3 ثوان
useEffect(()=>{
if(validationErrors.length !==0){
  setTimeout(()=>{
    setValidationErrors([]);
  }, 3000)
}
}, [validationErrors]);


//دالة للتحقق من الحقول اذا ما كانت فترغة و ترسل التنبيهات للمستخدم
const validate = () =>{
  const validationErrors = [];
  let passed = true;

  if(!title){
    validationErrors.push('الرجاء إدخال عموان الملاحظة');
    passed = false;
  }
  if(!content){
    validationErrors.push('الرجاء كتابة المحتوى');
    passed = false;
  }
  setValidationErrors(validationErrors);
  return passed;
}



//انشاء دالة للحفظ في التخزين المحلي
const saveToLocalStorage = (key, value)=>{
localStorage.setItem(key,JSON.stringify(value));
};

// دالة تغيير قيمة حقل العنوان مع كل حرف يدخله المستخدم
const changeTitleHandler = (event) =>{
  setTitle(event.target.value);
}

// دالة تغيير قيمة حقل المحتوى مع كل حرف يدخله المستخدم
const changeContentHandler = (event) =>{
  setContent(event.target.value);
}

//دالة حفظ الملاحظة الجديدة
const saveNoteHandler = ()=>{
  if(!validate())return;
  const note = {
    id : new Date(),
    title : title,
    content : content
  }
  const updateNotes = [...notes,note];
  saveToLocalStorage('notes', updateNotes);
  setNotes(updateNotes);
  setCreating(false);
  setSelectedNote(note.id);
  setTitle('');
  setContent('');
}


//تعديل ملاحظة
const updateNoteHandler = () =>{
  if(!validate())return;
  const updatedNotes = [...notes];
  const IndexOfNote  = notes.findIndex(note => note.id === selectedNote);

  updatedNotes[IndexOfNote] = {
    id : selectedNote,
    title : title,
    content : content
  };
  setNotes(updatedNotes);
  saveToLocalStorage('notes',updatedNotes);
  setEditing(false);
  setTitle('');
  setContent('');
}


//الانتقال الى وضع التعديل
const editNoteHandler = () =>{
  const note = notes.find(note => note.id === selectedNote);
  setEditing(true);
  setTitle(note.title);
  setContent(note.content);
}


//اختيار ملاحظة 
const selectNoteHandler = noteId => {
  setSelectedNote(noteId);
  setCreating(false);
  setEditing(false);
}


// الانتقال اى واجهة اضافة ملاحظة جديدة
const addNotehandler = () =>{ 
  setCreating(true);
  setEditing(false);
  setTitle('');
  setContent('');
}


//حذف ملاحظة
const deleteNoteHandler = () => {
  const updatedNotes = [...notes];
  const NoteIndex = notes.findIndex(note => note.id == selectedNote);
  console.log(NoteIndex)
  notes.splice(NoteIndex,1);
  saveToLocalStorage('notes',notes);
  setNotes(notes);
}

//استمارة ادخال ملاحظة جديدة
  const getAddNote = () => {
    return (      
      <NoteForms
      formTitle = 'ملاحظة جديدة'
       title = {title}
       content = {content}
       titleChanged ={changeTitleHandler}
       contentChanged ={changeContentHandler}
       submitClicked ={saveNoteHandler}
       submitText ='حفظ'
      />     
    );
  };


  // عرض الملاحظة المختارة
  const getPreview = () => {
    // اذا لم توجد اي ملاحظة مسجلة على الاقل
    if(notes.length === 0 ) {
      return <Message title='لا يوجد ملاحظة'/>  
    }
    // اذا لم يتم اختيار اي ملاحظة
    if(! selectedNote){
      return <Message title='الرجاء اختيار ملاحظة'/>
    }

  // اذا تم اختيار ملاحظة
  const note = notes.find(note => {return note.id === selectedNote}); 
  let noteDisplay = (
    <div>
      <h2> {note.title}  </h2>
      <p>{note.content}</p>
    </div>
  );

  if (editing) {  
    noteDisplay = (    
        <NoteForms
          formTitle = 'تعديل ملاحظة'
          title = {title}
          content = {content}
          titleChanged ={changeTitleHandler}
          contentChanged ={changeContentHandler}
          submitClicked ={updateNoteHandler}
          submitText ='تعديل'
      />              
    );
  };
    return (
      <div>
           {!editing && <div className="note-operations">
              <a href="#" onClick={editNoteHandler}>
                <i className="fa fa-pencil-alt" />
              </a>
              <a href="#"  onClick={deleteNoteHandler}>
                <i className="fa fa-trash" />
              </a>
            </div>
           }
         {noteDisplay}
      </div>
    );
  };
 

// التطبيق الرئيسي
  return (
    <div className="App">
      <NotesContainer>
       <NotesList>
        {notes.map(note => <Note key = {note.id} title = {note.title} noteClicked ={ () => selectNoteHandler(note.id) } active={selectedNote === note.id} /> ) }
        </NotesList>
        <button className="add-btn" onClick={addNotehandler}>+</button>
      </NotesContainer>
      <Preview>
        {creating ? getAddNote():getPreview()}
      </Preview>
      {validationErrors.length !==0  && <Alert validationMessages={validationErrors} />} 

    </div>
  );
}


export default App;
