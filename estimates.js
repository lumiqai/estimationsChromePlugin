setInterval(function() {
// setTimeout(function() {
	const columns = document.querySelectorAll(".PlannerRoot .planTaskBoardPage .taskBoardColumn");
	columns.forEach(function(column) {
		let columnTitleSection = column.querySelector(".columnHeader .titleSection");
		if (columnTitleSection === null) {
			// columns will only be loaded in DOM once they are in viewport.
			return;
		}

		const cards = column.querySelectorAll(".taskCard");

		cards.forEach(function(card) {
			const cardTitleDiv = card.querySelector(".title");
			if(cardTitleDiv.length === 0) {
				return; // continue each() loop
			}
			// get title without any HTML children
			const cardOrigTitle = cardTitleDiv.textContent;
			let cardTitle = cardOrigTitle;
			const regexp = new RegExp(/(\(\s*([^)]+)\s*\)|\[\s*([^\]]+)\s*])/, 'g');
			//const regexp = new RegExp(/(\(\s*([^)]+)\s*\)|\[\s*([^\]]+)\s*]|\{\s*([^}]+)\s*})/, 'g');
			regexp.lastIndex = 0;
			let matchResult = regexp.exec(cardTitle);
			let extraRowSpans = [];

			// the i count is to prevent endless loops, e.g. by removing the "g"lobal option in regexp above
			let i=0;
			while(i < 20 && matchResult !== null) {
				if(matchResult.length === 4) {
					let typeContent;
					let matchIndex;
					// we expect four result items:
					// 0: full string match, 1: surrounding parenthesis,  2: left parentheses for '(...)' matches, 3: right parentheses for '[...]' matches
					if(matchResult[2] !== undefined) {
						typeContent = "label-default";
						matchIndex = 2;
					}
					if(matchResult[3] !== undefined) {
						typeContent = "label-info";
						matchIndex = 3;
					}
					if (typeContent) {
						const value = parseFloat(matchResult[matchIndex]);
						let newRowSpan = document.createElement("span");
						newRowSpan.classList.add("bootstrap-iso");
						newRowSpan.style.margin = "3px";
						let newLabel = document.createElement("span");
						newLabel.classList.add("label");
						newLabel.classList.add(typeContent);
						if (!isNaN(value)) {
							newLabel.setAttribute("data-value", value.toString());
						}
						newLabel.textContent = matchResult[matchIndex];
						newRowSpan.appendChild(newLabel);
						extraRowSpans.push(newRowSpan);

						cardTitle = cardTitle.slice(0, matchResult.index) + cardTitle.slice(matchResult.index + matchResult[matchIndex].length + 2);
					}
				}
				regexp.lastIndex = 0;
				matchResult = regexp.exec(cardTitle);
				++i;
			}

			const regexp2 = new RegExp(/(\{\s*([^}]+)\s*})/, 'g');
			let matchResult2 = regexp2.exec(cardTitle);
			if (matchResult2 !== null){
				cardTitle = cardTitle.slice(0, matchResult2.index) + cardTitle.slice(matchResult2.index + matchResult2[2].length + 2);
				typeContent = "label-primary"
				if (typeContent) {
					let newRowSpan = document.createElement("span");
					newRowSpan.classList.add("bootstrap-iso");
					newRowSpan.style.margin = "3px";
					let newLabel = document.createElement("span");
					newLabel.classList.add("label");
					newLabel.classList.add(typeContent);
					newLabel.setAttribute("data-value", matchResult2[2]);
					newLabel.textContent = matchResult2[2];
					newRowSpan.appendChild(newLabel);
					extraRowSpans.push(newRowSpan);
				}
			}


			if(extraRowSpans.length > 0) {
				let extraRow = card.querySelector(".extraRow");
				if(extraRow) {
					extraRow.remove();
				}
				let topBar = card.querySelector(".topBar");
				if(topBar) {
					extraRow = document.createElement("div");
					extraRow.classList.add("extraRow");
					extraRow.style.marginTop = "10px";
					extraRowSpans.forEach(it => extraRow.appendChild(it));
					topBar.appendChild(extraRow);
				}
				cardTitleDiv.textContent = cardTitle;
			}
		});

		// Calculate column sum
		let sumColumnRemainingEstimate = 0;
		let hasRemainingSum = false;
		column.querySelectorAll("div.extraRow span.label-info").forEach(function(it) {
			let value = it.getAttribute('data-value');
			if(value) {
				sumColumnRemainingEstimate += parseFloat(value);
				hasRemainingSum = true;
			}
		});
		sumColumnRemainingEstimate = Math.round(sumColumnRemainingEstimate * 100) / 100;

		let sumColumnOriginalEstimate = 0;
		let hasOriginalSum = false;
		column.querySelectorAll("div.extraRow span.label-default").forEach(function(it) {
			let value = it.getAttribute('data-value');
			if(value) {
				sumColumnOriginalEstimate += parseFloat(value);
				hasOriginalSum = true;
			}
		});
		sumColumnOriginalEstimate = Math.round(sumColumnOriginalEstimate * 100) / 100;

		// set sum of card estimations on colum title
		let sumHtml = document.createElement("div");
		sumHtml.classList.add("bootstrap-iso");
		sumHtml.classList.add("colEstimatesPlugin");

		if(hasOriginalSum) {
			let originalEstimateEl = document.createElement("div");
			originalEstimateEl.classList.add("label");
			originalEstimateEl.classList.add("label-default");
			originalEstimateEl.style.margin = "3px";
			originalEstimateEl.textContent = sumColumnOriginalEstimate;
			sumHtml.appendChild(originalEstimateEl);
		}

		if(hasRemainingSum) {
			let remainEstimateEl = document.createElement("div");
			remainEstimateEl.classList.add("label");
			remainEstimateEl.classList.add("label-info");
			remainEstimateEl.style.margin = "3px";
			remainEstimateEl.textContent = sumColumnRemainingEstimate;
			sumHtml.appendChild(remainEstimateEl);
		}
		const estimatesPluginDiv = columnTitleSection.querySelector(".colEstimatesPlugin");
		if(estimatesPluginDiv) {
			estimatesPluginDiv.remove();
		}
		columnTitleSection.appendChild(sumHtml)
	});

 }, 3000);
