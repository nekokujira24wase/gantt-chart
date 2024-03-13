// const projectDate = {
//     projectName: "project01",
//     startDate: [2023, 1, 1],
//     endDate: [2023, 7, 31],
// }
export function createDate(parentElement, startDate, endDate) {
    // 日付部分を作成
    const startYear = startDate[0];
    const endYear   = endDate[0];
    const yearSpan  = endYear + 1 - endYear;

    const part1      = endYear - startYear;
    const endMonth   = endDate[1];
    const startMonth = startDate[1];
    const monthSpan  = (part1*12) + endMonth - startMonth + 1

    // yearWrapper = 年、(月、日)を子要素に持つdivタグをyearSpan分だけ生成
    // year = 年を表記するdivタグをyearSpan分だけ生成
    for (let i = 0; i < yearSpan; i++) {
        const yearWrapper = document.createElement("div");
        yearWrapper.setAttribute("class", `year-${startYear + i}`);

        const year = document.createElement("div");
        year.textContent = `${startYear + i}年`;
        year.setAttribute("class", "year-block");
        year.setAttribute("data-year", `${startYear + i}`);

        const monthDaysWrapper = document.createElement("div");
        monthDaysWrapper.setAttribute("class", "month-days-wrapper");

        yearWrapper.appendChild(year);
        yearWrapper.appendChild(monthDaysWrapper);
        parentElement.appendChild(yearWrapper);
    }

    let yearCnt = 0;
    for (let i = startMonth ; i < monthSpan + startMonth; i++) {
        const nowMonth = i % 12;

        const monthWrapper = document.createElement("div");
        monthWrapper.setAttribute("class", `month-${nowMonth}`);

        const month = document.createElement("div");
        month.textContent = `${nowMonth}月`;
        month.setAttribute("class", "month-block");
        month.setAttribute("data-mont", `${nowMonth}`);

        const daysWrapper = document.createElement("div");
        daysWrapper.setAttribute("class", "days-wrapper");

        // 該当月の総日数を算出
        const daysInMonth = new Date(startYear+yearCnt, i, 0).getDate();
        // 総日数分divタグを生成
        for (let j = 1; j <= daysInMonth; j++) {
            const day = document.createElement("div");
            day.textContent = `${j}日`;
            day.setAttribute("class", `day-${j} day-block`);
            day.setAttribute("data-day", `${startYear+yearCnt}-${nowMonth}-${j}`)
            daysWrapper.appendChild(day);
        }

        monthWrapper.appendChild(month);
        monthWrapper.appendChild(daysWrapper);

        const nowYearDiv = parentElement.children[yearCnt];
        const nowMonthDaysWrapper = nowYearDiv.children[1];
        nowMonthDaysWrapper.appendChild(monthWrapper);

        yearCnt += nowMonth === 11 ? 1 : 0;
    }
};