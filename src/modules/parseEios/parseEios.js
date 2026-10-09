import { jmuConnection, jmuLocalConnection } from '../../database/knexfile.js';

const connection = jmuConnection;

const getSpecialties = (year) => {
  return connection('specialties').where('year_admission', year);
};

const getProfiles = (idSpecialty) => {
  return connection('specialty_profile').where('id_specialty', idSpecialty);
};

const createSpecialty = (trx, specialtyData) => {
  return trx('specialties').insert(specialtyData, 'id');
};

const createProfile = (trx, profileData) => {
  return trx('specialty_profile').insert(profileData, 'id');
};

export const parseEios = async () => {
  const trx = await connection.transaction();
  let countProfiles = 0;

  try {
    const specialities = await getSpecialties(2025);

    for (const specialty of specialities) {
      const oldId = specialty.id;
      delete specialty.id;
      delete specialty.year_admission;
      delete specialty.record_book_counter;

      const profiles = await getProfiles(oldId);
      const [{ id: specialtyId }] = await createSpecialty(trx, {
        ...specialty,
        year_admission: 2026,
      });

      for (const profile of profiles) {
        delete profile.id;
        delete profile.id_specialty;

        await createProfile(trx, { ...profile, id_specialty: specialtyId });
      }
      countProfiles += profiles.length;
    }

    await trx.commit();
    console.log(`Создано ${specialities.length} специальностей и ${countProfiles} профилей.`);
  } catch (err) {
    await trx.rollback();
    console.error('Error parsing EIOS data:', err);
  }
};
