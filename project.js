const Encoding =
    "FblG2bGg2jkPf9DR0Y%2BXAF%2FcnYVLse2mSC4JN3J%2Byl5exmUj5b8M7aCtzJl%2FRE6cyocHqTGwBJgPzkxP1x%2F7XA%3D%3D";
const Decoding =
    "FblG2bGg2jkPf9DR0Y+XAF/cnYVLse2mSC4JN3J+yl5exmUj5b8M7aCtzJl/RE6cyocHqTGwBJgPzkxP1x/7XA==";

const arrowBtn = document.querySelector(".arrowBtn");
const customOptionsLists = document.querySelectorAll(".custom-options");
const selectLists = document.querySelectorAll(".selectlist");

const apiQueryParams = {
    bgnde: null, // 유기날짜(검색 시작일)
    endde: null, // 유기날짜(검색 종료일)
    upkind: null, // 축종코드
    kind: null, // 품종코드
    upr_cd: null, // 시도코드
    org_cd: null, // 시군구코드
    care_reg_no: null, // 보호소번호
    state: null, // 상태(전체, 공고중, 보호중)
    neuter_yn: null, // 중성화 여부
    pageNo: 1, // 페이지 번호
    numOfRows: 10, // 페이지당 보여줄 개수
    _type: "json", // 응답 형식
};

const _type = "json";

let userInput = {
    upr_cd: null,
    org_cd: null,
    upkind: null,
    kind: null,
};

let REGIONDATA;
let KINDDATA;
let observer;
let sec1count = 0;
let totalPages = 0;
let sec1page = 1;
let sec2page = 1;

function setDropdownStyle() {
    const lists = document.querySelectorAll(".custom-options");
    const Con = document.querySelector(".custom-option");

    const ConHeight = Con.offsetHeight;

    lists.forEach((element) => {
        element.style.height = `${ConHeight * 5}px`;
    });
}

selectLists.forEach(function (element) {
    element.addEventListener("click", function () {
        this.classList.toggle("open");
    });
});

window.addEventListener("click", function (e) {
    for (const select of document.querySelectorAll(".selectlist")) {
        if (!select.contains(e.target)) {
            select.classList.remove("open");
        }
    }
});

async function createSidoDropdown() {
    const regionData = await getRegionData();

    REGIONDATA = regionData;

    const selectlist = document.querySelector(".selectlist.sido");

    const optionList = selectlist.querySelector(".custom-options");

    regionData.forEach((sido) => {
        const sidoOption = document.createElement("div");
        sidoOption.classList.add("custom-option");
        sidoOption.dataset.value = `${sido.code}`;
        sidoOption.textContent = `${sido.name}`;

        optionList.appendChild(sidoOption);
    });
}

function initDropdown(selectlistClass) {
    const selectlist = document.querySelector(`.${selectlistClass}`);

    const showOption = selectlist.querySelector(".selected__highlight");
    showOption.innerHTML = "-";

    if (selectlist) {
        const optionList = selectlist.querySelector(".custom-options");
        if (optionList) {
            optionList.innerHTML = "";
        } else {
            console.warn(
                `No .custom-options element found in .${selectlistClass}.`
            );
        }
    } else {
        console.warn(`No .${selectlistClass} element found.`);
    }
}

function createSigunguDropdown(sido) {
    const selectlist = document.querySelector(".selectlist.sigungu");
    const optionList = selectlist.querySelector(".custom-options");
    const sigunguData = sido.list;

    if (!sigunguData) return;

    sigunguData.forEach((sigungu) => {
        const sidoOption = document.createElement("div");
        sidoOption.classList.add("custom-option");
        sidoOption.dataset.value = `${sigungu.code}`;
        sidoOption.textContent = `${sigungu.name}`;

        optionList.appendChild(sidoOption);
    });
}

async function getKindData() {
    const kindData = [
        {
            type: "강아지",
            code: 417000,
            details: [],
        },
        {
            type: "고양이",
            code: 422400,
            details: [],
        },
        {
            type: "기타",
            code: 429900,
            details: [],
        },
    ];

    for (const kind of kindData) {
        const response = await fetch(
            `http://apis.data.go.kr/1543061/abandonmentPublicSrvc/kind?up_kind_cd=${kind.code}&serviceKey=${Encoding}&_type=${_type}`
        );
        const kindDetailData = await response.json();

        if (Object.keys(kindDetailData.response.body.items).length > 0) {
            const list = kindDetailData.response.body.items.item.map(
                (kind) => ({
                    kindCd: kind.kindCd,
                    knm: kind.knm,
                })
            );
            const kindToUpdate = kindData.find((k) => k.code === kind.code);
            if (kindToUpdate) {
                kindToUpdate.details = list;
            }
        }
    }
    KINDDATA = kindData;
    return kindData;
}

async function createKindDropdown() {
    const kindData = await getKindData();

    const selectlist = document.querySelector(".selectlist.kind");

    const optionList = selectlist.querySelector(".custom-options");

    kindData.forEach((kind) => {
        const kindOption = document.createElement("div");
        kindOption.classList.add("custom-option");
        kindOption.dataset.value = kind.code;
        kindOption.textContent = `${kind.type}`;

        optionList.appendChild(kindOption);
    });
}

async function createKindDetailDropdown(kind) {
    const selectlist = document.querySelector(".selectlist.kindDetail");
    const optionList = selectlist.querySelector(".custom-options");
    const kindDetailData = kind.details;

    if (!kindDetailData) return;

    kindDetailData.forEach((kind) => {
        const kindDetailOption = document.createElement("div");
        kindDetailOption.classList.add("custom-option");
        kindDetailOption.dataset.value = `${kind.kindCd}`;
        kindDetailOption.textContent = `${kind.knm}`;

        optionList.appendChild(kindDetailOption);
    });
}

function initAnimalCardList() {
    const animal__list = document.querySelector(".animal__list");
    animal__list.innerHTML = "";
}

function handleOptionClick(e) {
    if (e.target.classList.contains("custom-option")) {
        const customOptions = e.target.closest(".custom-options");

        if (!customOptions) return;

        const allOptions = customOptions.querySelectorAll(
            ".custom-option.selected"
        );
        allOptions.forEach((option) => option.classList.remove("selected"));

        e.target.classList.add("selected");

        const selectlist = e.target.closest(".selectlist");

        const topDropdown = customOptions
            .closest(".selectlist")
            .querySelector(".selected__highlight");

        updateUserInput(selectlist, e.target.dataset.value);

        sec2page = 1;

        initAnimalCardList();
        setAnimalCardList().then(() => {
            resetInfiniteScroll();
        });

        if (topDropdown) {
            topDropdown.textContent = e.target.textContent;

            if (selectlist.classList.contains("sido")) {
                initDropdown("sigungu");
                const selectedValue = e.target.dataset.value;
                const selectedItem = REGIONDATA.find(
                    (item) => item.code === selectedValue
                );
                createSigunguDropdown(selectedItem);
            } else if (selectlist.classList.contains("kind")) {
                initDropdown("kindDetail");
                const selectedValue = e.target.dataset.value;
                const selectedItem = KINDDATA.find(
                    (item) => item.code === parseInt(selectedValue)
                );
                createKindDetailDropdown(selectedItem);
            }
        } else {
            console.warn("에러");
        }
    }
}

async function getRegionData() {
    const numOfRows = 17;
    const pageNo = 1;

    const response = await fetch(
        `http://apis.data.go.kr/1543061/abandonmentPublicSrvc/sido?numOfRows=${numOfRows}&pageNo=${pageNo}&serviceKey=${Encoding}&_type=${_type}`
    );

    const data = await response.json();

    const regionData = data.response.body.items.item.map((region) => ({
        code: region.orgCd,
        name: region.orgdownNm,
        list: [],
    }));

    for (const region of regionData) {
        let regionCode = region.code;
        const response = await fetch(
            `http://apis.data.go.kr/1543061/abandonmentPublicSrvc/sigungu?upr_cd=${regionCode}&serviceKey=${Encoding}&_type=${_type}`
        );

        const data = await response.json();

        if (Object.keys(data.response.body.items).length > 0) {
            const list = data.response.body.items.item.map((region) => ({
                code: region.orgCd,
                name: region.orgdownNm,
            }));
            const regionToUpdate = regionData.find(
                (r) => r.code === regionCode
            );
            if (regionToUpdate) {
                regionToUpdate.list = list;
            }
        }
    }

    return regionData;
}



function getUserInput() {
    return userInput;
}

function updateUserInput(selectlist, value) {
    const classList = selectlist.classList;
    if (classList.contains("sido")) {
        userInput.upr_cd = value;
        userInput.org_cd = null;
    } else if (classList.contains("sigungu")) {
        userInput.org_cd = value;
    } else if (classList.contains("kind")) {
        userInput.upkind = value;
        userInput.kind = null;
    } else if (classList.contains("kindDetail")) {
        userInput.kind = value;
    }
}

async function fetchData(
    {
        bgnde,
        endde,
        upkind,
        kind,
        upr_cd,
        org_cd,
        care_reg_no,
        state,
        neuter_yn,
        pageNo,
        numOfRows,
        _type,
    },
    getCount = false
) {
    const url = new URL(
        "http://apis.data.go.kr/1543061/abandonmentPublicSrvc/abandonmentPublic"
    );

    if (bgnde) url.searchParams.set("bgnde", bgnde);
    if (endde) url.searchParams.set("endde", endde);
    if (upkind) url.searchParams.set("upkind", upkind);
    if (kind) url.searchParams.set("kind", kind);
    if (upr_cd) url.searchParams.set("upr_cd", upr_cd);
    if (org_cd) url.searchParams.set("org_cd", org_cd);
    if (care_reg_no) url.searchParams.set("care_reg_no", care_reg_no);
    if (state) url.searchParams.set("state", state);
    if (neuter_yn) url.searchParams.set("neuter_yn", neuter_yn);
    if (pageNo) url.searchParams.set("pageNo", pageNo);
    if (numOfRows) url.searchParams.set("numOfRows", numOfRows);
    if (_type) url.searchParams.set("_type", _type);

    url.searchParams.set("serviceKey", Decoding);

    const response = await fetch(url);
    const data = await response.json();

    if (getCount) {
        const count = data.response.body.totalCount;
        sec1count = count;
    }

    try {
        const animalData = data.response.body.items.item.map((data) => ({
            popfile: data.popfile,
            kindCd: data.kindCd,
            colorCd: data.colorCd,
            sexCd: data.sexCd,
            age: data.age,
            weight: data.weight,

            happenDt: data.happenDt,
            happenPlace: data.happenPlace,

            processState: data.processState,

            noticeSdt: data.noticeSdt,
            noticeEdt: data.noticeEdt,

            careNm: data.careNm,
            careAddr: data.careAddr,
            chargeNm: data.chargeNm,

            orgNm: data.orgNm,

            ID: data.desertionNo,
            noticeNo: data.noticeNo,

            specialMark: data.specialMark,
        }));

        return animalData;
    } catch {
        return;
    }
}

function getDate() {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");

    const ennde = year + month + "01";

    return ennde;
}

function createAnimalCards(animalData, containerSelector) {
    const animal__list = document.querySelector(containerSelector);

    try {
        animalData.forEach((data) => {
            const animalCard = document.createElement("li");
            animalCard.classList.add("card");

            let sexIcon = "?";
            if (data.sexCd === "F") {
                sexIcon = `<span class="material-symbols-outlined female">female</span>`;
            } else if (data.sexCd === "M") {
                sexIcon = `<span class="material-symbols-outlined male">male</span>`;
            }

            animalCard.innerHTML = `
            <div class="card__con">
                <div class="img__wrap">
                    <img class="con__img" src="${data.popfile}"/>
                </div>
                <div class="con__desc">
                    <div class="sg__wrap">
                        <div class="species">${data.kindCd}</div>
                        <div class="gender">${sexIcon}</div>
                    </div>
                    <div class="location btmdesc">
                        <span class="material-symbols-outlined">location_on</span>
                        <span class="location__wrap">${data.happenPlace}</span>
                    </div>
                    <div class="period btmdesc">
                        <span class="material-symbols-outlined">calendar_month</span>
                        ${data.noticeSdt} - ${data.noticeEdt}
                    </div>
                    <div class="careNm btmdesc">
                        <span class="material-symbols-outlined">home</span>
                        ${data.careNm}
                    </div>
                </div>
            </div>
            `;

            animalCard.addEventListener("click", () => {
                showModal(data);
            });

            animal__list.appendChild(animalCard);
        });
    } catch {
        return;
    }
}

function clearList(target) {
    const list = document.querySelector(target);
    list.innerHTML = "";
}

function makeSkeletonCard(count, target) {
    const targetList = document.querySelector(target);
    for (let i = 0; i < count; i++) {
        const skeletonCard = document.createElement("div");
        skeletonCard.classList.add("skeleton-card");

        skeletonCard.innerHTML = `
        <div class="skeleton-con-wrap">
            <div class="skeleton-card-img"></div>
            <div class="skeleton-card-title"></div>
            <div class="skeleton-card-desc"></div>
        </div>
        `;

        targetList.appendChild(skeletonCard);
    }
}

let isSkeletonRemoved = false;

function removeSkeletonCard(targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const skeletonCards = document.querySelectorAll(".skeleton-card");
    skeletonCards.forEach((card) => {
        if (target.contains(card)) {
            target.removeChild(card);
        }
    });
}

async function setEmergencyAnimalCardList() {
    const itemsPerPage = 6;

    const apiQueryParams = {
        pageNo: sec1page,
        numOfRows: itemsPerPage,
        _type: "json",
        state: "notice",
        endde: getDate(),
    };

    makeSkeletonCard(itemsPerPage, ".protect__animal__list");
    isSkeletonRemoved = false;

    const animalData = await fetchData(apiQueryParams, true);
    totalPages = Math.ceil(sec1count / itemsPerPage);

    setTimeout(() => {
        if (!isSkeletonRemoved) {
            removeSkeletonCard(".protect__animal__list");
        }
    }, 1000);

    if (isSkeletonRemoved) {
        createAnimalCards(animalData, ".protect__animal__list");
    } else {
        setTimeout(() => {
            createAnimalCards(animalData, ".protect__animal__list");
        }, 1000);
    }
}

function createPageElements(totalPages) {
    return Array.from({ length: totalPages }, (_, i) => {
        const page = document.createElement("li");
        page.classList.add("pageNum");
        page.textContent = i + 1;
        return page;
    });
}

function pageInit() {
    const firstPage = document.querySelector(".pageNum");
    if (firstPage) {
        firstPage.classList.add("selected");
    }
}

function updateSelectedPage(selectedPageNumber) {
    const pageElements = document.querySelectorAll(".pageNum");
    pageElements.forEach((pageElement) => {
        if (parseInt(pageElement.textContent, 10) === selectedPageNumber) {
            pageElement.classList.add("selected");
        } else {
            pageElement.classList.remove("selected");
        }
    });
}

function handlePageClick(pageNumber) {
    return () => {
        clearList(".protect__animal__list");
        sec1page = pageNumber;
        updateSelectedPage(sec1page);
        setEmergencyAnimalCardList();
    };
}

function updateSelectedPage(selectedPageNumber) {
    const pageElements = document.querySelectorAll(".pageNum");
    pageElements.forEach((pageElement) => {
        if (parseInt(pageElement.textContent, 10) === selectedPageNumber) {
            pageElement.classList.add("selected");
        } else {
            pageElement.classList.remove("selected");
        }
    });
}

function setupPagination(totalPages) {
    const pageCon = document.querySelector(".pagination");

    const pageElements = createPageElements(totalPages);
    pageElements.forEach((pageElement, index) => {
        pageElement.addEventListener("click", handlePageClick(index + 1));
        pageCon.appendChild(pageElement);
    });

    pageInit();
}

async function setAnimalCardList() {
    const Params = {
        pageNo: sec2page,
        numOfRows: 30,
        _type: "json",
    };
    const apiQueryParams = Object.assign({}, userInput, Params);

    const animalData = await fetchData(apiQueryParams);
    console.log(sec2page);
    createAnimalCards(animalData, ".animal__list");
}

function getDropdownData() {
    const dropdownList = document.querySelectorAll("");
    console.log();
}

function showModal(animal) {
    const modalOverlay = document.querySelector(".modal-overlay");

    modalOverlay.querySelector(".modal-image").src = animal.popfile;

    modalOverlay.querySelector(".modal-kind").textContent = animal.kindCd;
    modalOverlay.querySelector(".modal-species .con").textContent =
        animal.kindCd;
    modalOverlay.querySelector(".modal-gender .con").textContent = animal.sexCd;
    modalOverlay.querySelector(".modal-age .con").textContent = animal.age;
    modalOverlay.querySelector(".modal-colorCd .con").textContent =
        animal.colorCd;
    modalOverlay.querySelector(".modal-weight .con").textContent =
        animal.weight;

    modalOverlay.querySelector(".modal-processState .con").textContent =
        animal.processState;

    modalOverlay.querySelector(".modal-happenDt .con").textContent =
        animal.happenDt;
    modalOverlay.querySelector(".modal-happenPlace .con").textContent =
        animal.happenPlace;

    modalOverlay.querySelector(
        ".modal-period .con"
    ).textContent = `${animal.noticeSdt} - ${animal.noticeEdt}`;

    modalOverlay.querySelector(".modal-careNm .con").textContent =
        animal.careNm;
    modalOverlay.querySelector(".modal-chargeNm .con").textContent =
        animal.chargeNm;

    modalOverlay.querySelector(".modal-specialMark .con").textContent =
        animal.specialMark;

    modalOverlay.style.display = "flex";
}

const modalOverlay = document.querySelector(".modal-overlay");
modalOverlay.addEventListener("click", (e) => {
    if (
        e.target === modalOverlay ||
        e.target.classList.contains("modal-close")
    ) {
        modalOverlay.style.display = "none";
    }
});

function setupInfiniteScroll() {
    const animal__list = document.querySelector(".animal__list");

    const options = {
        root: null,
        rootMargin: "0px 0px 0px 0px",
        threshold: 0,
    };

    const callback = async (entries, observer) => {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting) {
                const currentInput = getUserInput();
                sec2page++;
                await setAnimalCardList(currentInput);
                observer.unobserve(entry.target);
                if (animal__list.lastElementChild) {
                    console.log(animal__list.lastElementChild);
                    observer.observe(animal__list.lastElementChild);
                }
            }
        });
    };

    observer = new IntersectionObserver(callback, options);

    if (animal__list.lastElementChild) {
        observer.observe(animal__list.lastElementChild);
    } else {
        console.error("무한 스크롤 에러");
    }
}

function resetInfiniteScroll() {
    if (observer) {
        observer.disconnect();
    }

    setupInfiniteScroll();
}

function init() {
    setEmergencyAnimalCardList().then(() => {
        setupPagination(totalPages);
    });

    createSidoDropdown();
    createKindDropdown();
    setDropdownStyle();

    setAnimalCardList().then(() => {
        setupInfiniteScroll();
    });

    arrowBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });

    customOptionsLists.forEach((customOptions) => {
        customOptions.addEventListener("click", handleOptionClick);
    });
}

init();
