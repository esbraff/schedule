<template>
  <div id="app">
    <div id="form" class="h-input-group">
      <AutoComplete
        emptyContent="Ничего не найдено"
        placeholder="ФИО Преподавателя"
        :option="inputOptions"
        spellcheck="false"
        v-model="query"
        type="text"
      />
      <Button @click="search">Поиск</Button>
    </div>
    <div id="schedule-item-list" v-if="found.length !== 0">
      <div class="schedule-item" v-for="(item, i) in found" v-bind:key="i">
        <div class='schedule-item-left'>
          <div class='schedule-item-left-name'>{{ item.lesson.name }}</div>
          <div class='schedule-item-left-type'>{{ item.lesson.type }}</div>
          <div class='schedule-item-left-room'>Кабинет {{ item.lesson.classroom }}</div>
          <div class='schedule-item-left-group'>{{ item.group }}</div>
        </div>
        <div class='schedule-item-right'>
          <div class='schedule-item-right-dennum'>{{ item.dennum }}</div>
          <div class='schedule-item-right-day'>{{ item.day }}</div>
          <br/>
          <div class='schedule-item-right-time' v-if='checkTime(item.timecode, item.dennum)'>{{ item.lesson.start_time }} - {{ item.lesson.end_time }}</div>
          <div class='schedule-item-right-time inactive' v-else>{{ item.lesson.start_time }} - {{ item.lesson.end_time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const DAYS = {
  Monday: 'Понедельник',
	Tuesday: 'Вторник',
	Wednesday: 'Среда',
	Thursday: 'Четверг',
	Friday: 'Пятница',
	Saturday: 'Суббота',
	Sunday: 'Воскресенье'
};

const DENNUM = {
	denominator: 'Знаменатель',
	numerator: 'Числитель'
};

export default {
  name : 'app',
  data() {
    return {
      lecturers    : [],
      schedule     : [],
      found        : [],
      query        : '',
      inputOptions : {
        loadData: this.fetchLecturerSuggestions
      }
    }
  },
  methods: {
    async fetchLecturerSuggestions(input, cb) {
      if (this.lecturers.length !== 0) {
        cb(this.lecturers.filter(item => {
          return item.toLowerCase().indexOf(input.toLowerCase()) !== -1;
        }).slice(0, 5));
      } else {
        let cached = { }, dennum = 'Числитель';

        if (this.isOnline) {
          await fetch('https://petrsu.egipti.com/api/v1/schedule/')
            .then(res => res.json())
            .catch(() => { })
            .then(res => {
              cached = res;
              this.$offlineStorage.set('cached', res);
            });
          await fetch('https://petrsu.egipti.com/api/v1/week/')
            .then(res => res.text())
            .catch(() => { })
            .then(res => {
              dennum = res;
              this.$offlineStorage.set('dennum', res);
            });
        } else {
          cached = this.$offlineStorage.get('cached');
          dennum = this.$offlineStorage.get('dennum');
        }

        const temp = {
          denominator : [],
          numerator   : [],
          lecturers   : {}
        };

        for (const group in cached)
          for (const dennum in cached[group])
            for (const day in cached[group][dennum])
              for (const id in cached[group][dennum][day]) {
                const lesson = cached[group][dennum][day][id];
                const time = lesson.end_time.split(':').concat(Object.keys(DAYS).indexOf(day) + 1);

                temp.lecturers[lesson.lecturer] = null;

                temp[dennum].push({
                  group,
                  dennum: DENNUM[dennum],
                  day: DAYS[day],
                  lesson,
                  timecode: new Date(0, 0, time[2], parseInt(time[0]), parseInt(time[1])),
                });
              }
        
        this.schedule = dennum === 'Числитель'
          ? temp.numerator.concat(temp.denominator)
          : temp.denominator.concat(temp.numerator);

        this.lecturers = Object.keys(temp.lecturers);
        this.dennum = dennum;

        cb(this.lecturers.slice(0, 5));
      }
    },
    search() {
      this.found = this.schedule.filter(item => item.lesson.lecturer === this.query);
    },
    checkTime(timecode, dennum) {
      if (dennum !== this.dennum) return true;
      const now = new Date();

      return new Date(0, 0, now.getDay(), now.getHours(), now.getMinutes()) < timecode;
    }
  }
}
</script>

<style>
#app {
  text-align: center;
  padding: 1%;
}

#form {
  position: relative;
  margin: 0 auto;
  height: auto;
  width: 60%;
}

#schedule-item-list {
  margin: 0 auto;
  margin-top: 25px;
  height: auto;
  width: 65%;
  border: 1px lightgray solid;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 5px;
  display: table;
  padding: 5px;
}

.h-panel-title.schedule-item-type {
  font-size: 100%;
}

.schedule-item {
  border-bottom: 2px lightgray solid;
  display: inline-block;
  width: 100%;
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-item-left {
  text-align: left;
  float: left;
}

.schedule-item-right {
  text-align: right;
  float: right;
}

.schedule-item-left-name {
  font-size: 16px;
}

.schedule-item-left-type {
  font-size: 13px;
  color: gray;
}

.schedule-item-left-room, .schedule-item-left-group {
  font-size: 13px;
}

.schedule-item-right-dennum {
  font-size: 16px;
}

.schedule-item-right-day {
  font-size: 13px;
}

.schedule-item-right-time.inactive {
  color: gray;
}
</style>
