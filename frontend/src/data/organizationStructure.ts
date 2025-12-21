export interface EmployeeNode {
  id: number;
  full_name: string;
  position: string;
  work_phone: string;
  work_email: string;
  avatar_id?: number | null;
  children?: EmployeeNode[];
}

export interface DepartmentHierarchy {
  id: number;
  name: string;
  manager: EmployeeNode;
  children?: DepartmentHierarchy[];
}

export const organizationHierarchy: DepartmentHierarchy[] = [
  {
    id: 1,
    name: "Генеральный директор",
    manager: {
      id: 1,
      full_name: "Иван Петров",
      position: "Генеральный директор",
      work_phone: "+7 (999) 123-45-67",
      work_email: "ivan.petrov@company.com",
      avatar_id: null,
    },
    children: [
      {
        id: 2,
        name: "IT Отдел",
        manager: {
          id: 2,
          full_name: "Алексей Иванов",
          position: "Директор IT отдела",
          work_phone: "+7 (999) 234-56-78",
          work_email: "alexey.ivanov@company.com",
          avatar_id: null,
        },
        children: [
          {
            id: 3,
            name: "Backend",
            manager: {
              id: 3,
              full_name: "Дмитрий Сидоров",
              position: "Lead Backend Developer",
              work_phone: "+7 (999) 345-67-89",
              work_email: "dmitry.sidorov@company.com",
              avatar_id: null,
            },
            children: [
              {
                id: 4,
                name: "Backend Team",
                manager: {
                  id: 4,
                  full_name: "Сергей Смирнов",
                  position: "Senior Backend Developer",
                  work_phone: "+7 (999) 456-78-90",
                  work_email: "sergey.smirnov@company.com",
                  avatar_id: null,
                  children: [
                    {
                      id: 5,
                      full_name: "Виктор Морозов",
                      position: "Backend Developer",
                      work_phone: "+7 (999) 567-89-01",
                      work_email: "viktor.morozov@company.com",
                      avatar_id: null,
                    },
                    {
                      id: 6,
                      full_name: "Павел Волков",
                      position: "Backend Developer",
                      work_phone: "+7 (999) 678-90-12",
                      work_email: "pavel.volkov@company.com",
                      avatar_id: null,
                    },
                  ],
                },
              },
              {
                id: 7,
                name: "DevOps",
                manager: {
                  id: 7,
                  full_name: "Антон Козлов",
                  position: "DevOps Lead",
                  work_phone: "+7 (999) 789-01-23",
                  work_email: "anton.kozlov@company.com",
                  avatar_id: null,
                  children: [
                    {
                      id: 8,
                      full_name: "Марат Исмаилов",
                      position: "DevOps Engineer",
                      work_phone: "+7 (999) 890-12-34",
                      work_email: "marat.ismailov@company.com",
                      avatar_id: null,
                    },
                  ],
                },
              },
            ],
          },
          {
            id: 9,
            name: "Frontend",
            manager: {
              id: 9,
              full_name: "Елена Федорова",
              position: "Lead Frontend Developer",
              work_phone: "+7 (999) 901-23-45",
              work_email: "elena.fedorova@company.com",
              avatar_id: null,
              children: [
                {
                  id: 10,
                  full_name: "Максим Новиков",
                  position: "Senior Frontend Developer",
                  work_phone: "+7 (999) 012-34-56",
                  work_email: "maxim.novikov@company.com",
                  avatar_id: null,
                },
                {
                  id: 11,
                  full_name: "Ирина Соколова",
                  position: "Frontend Developer",
                  work_phone: "+7 (999) 123-34-67",
                  work_email: "irina.sokolova@company.com",
                  avatar_id: null,
                },
              ],
            },
          },
          {
            id: 12,
            name: "QA",
            manager: {
              id: 12,
              full_name: "Владимир Тестов",
              position: "QA Lead",
              work_phone: "+7 (999) 234-45-68",
              work_email: "vladimir.testov@company.com",
              avatar_id: null,
              children: [
                {
                  id: 13,
                  full_name: "Зинаида Кузнецова",
                  position: "QA Engineer",
                  work_phone: "+7 (999) 345-56-79",
                  work_email: "zinaida.kuznetsova@company.com",
                  avatar_id: null,
                },
                {
                  id: 14,
                  full_name: "Юрий Орлов",
                  position: "QA Engineer",
                  work_phone: "+7 (999) 456-67-80",
                  work_email: "yuri.orlov@company.com",
                  avatar_id: null,
                },
              ],
            },
          },
        ],
      },
      {
        id: 15,
        name: "HR Отдел",
        manager: {
          id: 15,
          full_name: "Наталья Берёзина",
          position: "Директор HR отдела",
          work_phone: "+7 (999) 567-78-91",
          work_email: "natalia.berezina@company.com",
          avatar_id: null,
        },
        children: [
          {
            id: 16,
            name: "Recruitment",
            manager: {
              id: 16,
              full_name: "Ольга Чайкина",
              position: "Recruitment Manager",
              work_phone: "+7 (999) 678-89-02",
              work_email: "olga.chaikina@company.com",
              avatar_id: null,
              children: [
                {
                  id: 17,
                  full_name: "Светлана Волкова",
                  position: "HR Specialist",
                  work_phone: "+7 (999) 789-90-13",
                  work_email: "svetlana.volkova@company.com",
                  avatar_id: null,
                },
              ],
            },
          },
        ],
      },
      {
        id: 18,
        name: "Финансовый отдел",
        manager: {
          id: 18,
          full_name: "Константин Беляев",
          position: "Финансовый директор",
          work_phone: "+7 (999) 890-01-24",
          work_email: "konstantin.belyaev@company.com",
          avatar_id: null,
        },
        children: [
          {
            id: 19,
            name: "Бухгалтерия",
            manager: {
              id: 19,
              full_name: "Татьяна Романова",
              position: "Главный бухгалтер",
              work_phone: "+7 (999) 901-12-35",
              work_email: "tatiana.romanova@company.com",
              avatar_id: null,
              children: [
                {
                  id: 20,
                  full_name: "Галина Степанова",
                  position: "Бухгалтер",
                  work_phone: "+7 (999) 012-23-46",
                  work_email: "galina.stepanova@company.com",
                  avatar_id: null,
                },
              ],
            },
          },
        ],
      },
    ],
  },
];
