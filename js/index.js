document.addEventListener('DOMContentLoaded', async function(){

	// VARIABLES
	const pageLimit = 50
	let currentPage = 20
	let dbSize = 0

	const MONSTER_URL = 'http://localhost:3000/monsters' 
	const MONSTER_PAGE_URL = `http://localhost:3000/monsters/?_limit=${pageLimit}&_page=`

	const monsterForm = document.getElementById('new-monster-form')
	const monsterContainer = document.getElementById('monster-container')

	const back_btns = document.getElementsByClassName('back-btn')
	const next_btns = document.getElementsByClassName('next-btn')
	const form_btn  = document.getElementById('toggle-form-btn')

	// MAIN
	await fetch(MONSTER_URL)
	.then(resp => resp.json())
	.then(monsters => dbSize = monsters.length)

	document.addEventListener('click', handleClickEvents)
	monsterForm.addEventListener('submit', new_monster)
	fetch_page()

	//											//
	// FUNCTION DEFINITIONS //
	//											//
	function handleClickEvents(e) {
		if(e.target.className === 'edit-btn') edit_monster(e.target.parentElement.parentElement)
		else if(e.target.className === 'delete-btn') delete_monster(e.target.parentElement.parentElement)
		else if(e.target.className === 'back-btn') fetch_page(--currentPage)
		else if(e.target.className === 'next-btn') fetch_page(++currentPage)
		else if(e.target.id === 'toggle-form-btn') toggle_form()
	}

	function check_buttons() {
		for(let k in back_btns)
			back_btns[k].disabled = currentPage === 1

		for(let k in next_btns)
			next_btns[k].disabled = dbSize === (currentPage-1) * pageLimit + monsterContainer.getElementsByClassName('monster-div').length
	}

	function fetch_page() {
		// console.log('page #',currentPage,' requested.')
		fetch(MONSTER_PAGE_URL+currentPage)
		.then(resp => resp.json())
		.then(monsters => show_monsters(monsters))
	}

	function show_monsters(monsters) {
		monsterContainer.innerHTML = ''
		monsters.forEach(add_monster_div)
		check_buttons()
	}

	function add_monster_div(monster) {
		monsterContainer.innerHTML += `
		<div class="monster-div" id=${monster.id}>
			<h2>${monster.name}</h2>
			<h4>Age: ${monster.age}</h4>
			<p>${monster.description}</p>
			<div class="button-div">
				<button class="edit-btn">✎ Edit</button>
				<button class="delete-btn">⌫ Delete</button>
			</div>
		</div>`
	}

	function toggle_form() {
		form_btn.innerText = form_btn.innerText.startsWith('Show') ? 'Hide new employee form' : 'Show new employee form'
		monsterForm.hidden = monsterForm.hidden ? false : true
	}

	function new_monster(e) {
		e.preventDefault()
		fetch(MONSTER_URL,{
	    method: 'POST',
	    headers: {'Content-Type':'application/json'},
	    body: JSON.stringify({
	    	'name': monsterForm.name.value,
	    	'age': monsterForm.age.value,
	    	'description': monsterForm.desc.value
	    })
	  })
	  .then(res => res.json())
	  .then(monster => {
	  	dbSize++
	  	if(monsterContainer.getElementsByClassName('monster-div').length < pageLimit) add_monster_div(monster)
	  	monsterForm.reset()
	  	check_buttons()
	  })
	}

	function edit_monster(monsterDiv) {
		if(monsterForm.name.value) monsterDiv.children[0].innerText = monsterForm.name.value
		if(monsterForm.age.value) monsterDiv.children[1].innerText = monsterForm.age.value
		if(monsterForm.desc.value) monsterDiv.children[2].innerText = monsterForm.desc.value

		fetch(MONSTER_URL+'/'+monsterDiv.id,{
	    method: 'PATCH',
	    headers: {'Content-Type':'application/json'},
	    body: JSON.stringify({
	    	'name': monsterDiv.children[0].innerText,
	    	'age': monsterDiv.children[1].innerText,
	    	'description': monsterDiv.children[2].innerText
	    })
	  })
	}

	function delete_monster(monsterDiv) {
		fetch(MONSTER_URL+'/'+monsterDiv.id,{ method: 'DELETE' })
		.then(() => {
			dbSize--
			monsterDiv.remove()
			if(monsterContainer.getElementsByClassName('monster-div').length === 0) currentPage--
			fetch_page()
		})
	}

	// END //
});
